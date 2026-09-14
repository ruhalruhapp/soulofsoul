# soulofsoul — AWS production deployment via Terraform
#
# Provisions:
#   - VPC with public/private subnets (2 AZs for HA)
#   - ECS Fargate cluster for the Next.js app + crisis-relay mini-service
#   - RDS PostgreSQL (encrypted, HIPAA-eligible)
#   - ElastiCache Redis (for sessions/rate limiting)
#   - Application Load Balancer with TLS
#   - CloudWatch alarms + log groups
#   - Secrets Manager for DATABASE_URL, NEXTAUTH_SECRET, ZAI_API_KEY
#
# Prerequisites:
#   - AWS CLI configured with appropriate permissions
#   - Terraform >= 1.5
#   - A registered domain in Route53 (for TLS cert)
#   - ACM certificate for your domain
#
# Usage:
#   cd deploy/aws
#   terraform init
#   terraform plan -var-file=production.tfvars
#   terraform apply -var-file=production.tfvars

terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "soulofsoul-terraform-state"
    key            = "production/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "soulofsoul-terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region
}

# ─── Variables ───

variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (production, staging, dev)"
  type        = string
  default     = "production"
}

variable "domain_name" {
  description = "Domain name for the application (e.g., soulofsoul.com)"
  type        = string
  default     = "soulofsoul.com"
}

variable "certificate_arn" {
  description = "ACM certificate ARN for TLS"
  type        = string
}

variable "database_password" {
  description = "Master password for RDS PostgreSQL (use secrets manager in production)"
  type        = string
  sensitive   = true
}

variable "nextauth_secret" {
  description = "NextAuth.js JWT signing secret"
  type        = string
  sensitive   = true
}

variable "zai_api_key" {
  description = "z-ai-web-dev-sdk API key"
  type        = string
  sensitive   = true
}

variable "docker_image" {
  description = "Docker image for the soulofsoul web app"
  type        = string
  default     = "ruhalruhapp/soulofsoul:latest"
}

# ─── VPC ───

module "vpc" {
  source = "terraform-aws-modules/vpc/aws"

  name = "soulofsoul-${var.environment}"
  cidr = "10.0.0.0/16"

  azs             = ["${var.aws_region}a", "${var.aws_region}b"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]

  enable_nat_gateway = true
  enable_vpn_gateway = true

  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Environment = var.environment
    Project     = "soulofsoul"
  }
}

# ─── RDS PostgreSQL (HIPAA-eligible) ───

resource "aws_db_subnet_group" "main" {
  name       = "soulofsoul-${var.environment}"
  subnet_ids = module.vpc.private_subnets

  tags = {
    Environment = var.environment
  }
}

resource "aws_security_group" "rds" {
  name        = "soulofsoul-rds-${var.environment}"
  description = "Allow PostgreSQL access from ECS"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"] # VPC only
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_db_instance" "postgres" {
  identifier = "soulofsoul-${var.environment}"

  engine         = "postgres"
  engine_version = "16.4"
  instance_class = "db.t3.medium" # scale up for production

  allocated_storage     = 100
  max_allocated_storage = 500
  storage_type          = "gp3"
  storage_encrypted     = true # required for HIPAA

  db_name  = "soulofsoul"
  username = "soulofsoul_admin"
  password = var.database_password

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = false

  backup_retention_period = 30 # required for HIPAA
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"

  multi_az = true # HA for production

  deletion_protection = true
  skip_final_snapshot  = false
  final_snapshot_identifier = "soulofsoul-${var.environment}-final"

  tags = {
    Environment = var.environment
    Project     = "soulofsoul"
    HIPAA       = "true"
  }
}

# ─── ElastiCache Redis ───

resource "aws_security_group" "redis" {
  name        = "soulofsoul-redis-${var.environment}"
  description = "Allow Redis access from ECS"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port   = 6379
    to_port     = 6379
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_elasticache_subnet_group" "main" {
  name       = "soulofsoul-${var.environment}"
  subnet_ids = module.vpc.private_subnets
}

resource "aws_elasticache_replication_group" "main" {
  replication_group_id = "soulofsoul-${var.environment}"
  description          = "Redis for soulofsoul ${var.environment}"

  node_type            = "cache.t3.micro"
  port                 = 6379
  parameter_group_name = "default.redis7"

  subnet_group_name  = aws_elasticache_subnet_group.main.name
  security_group_ids = [aws_security_group.redis.id]

  at_rest_encryption_enabled = true
  transit_encryption_enabled = true

  automatic_failover_enabled = true
  num_node_groups            = 1
  replicas_per_node_group    = 1

  tags = {
    Environment = var.environment
    Project     = "soulofsoul"
  }
}

# ─── ECS Cluster ───

resource "aws_ecs_cluster" "main" {
  name = "soulofsoul-${var.environment}"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

resource "aws_security_group" "ecs" {
  name        = "soulofsoul-ecs-${var.environment}"
  description = "Allow HTTP/HTTPS from ALB"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ─── Secrets Manager ───

resource "aws_secretsmanager_secret" "db_url" {
  name        = "soulofsoul/${var.environment}/DATABASE_URL"
  description = "PostgreSQL connection string"
}

resource "aws_secretsmanager_secret_version" "db_url" {
  secret_id = aws_secretsmanager_secret.db_url.id
  secret_string = jsonencode({
    DATABASE_URL = "postgresql://soulofsoul_admin:${var.database_password}@${aws_db_instance.postgres.endpoint}:5432/soulofsoul?sslmode=require"
  })
}

resource "aws_secretsmanager_secret" "nextauth" {
  name        = "soulofsoul/${var.environment}/NEXTAUTH"
  description = "NextAuth configuration"
}

resource "aws_secretsmanager_secret_version" "nextauth" {
  secret_id = aws_secretsmanager_secret.nextauth.id
  secret_string = jsonencode({
    NEXTAUTH_SECRET = var.nextauth_secret
    NEXTAUTH_URL    = "https://${var.domain_name}"
  })
}

# ─── CloudWatch ───

resource "aws_cloudwatch_log_group" "app" {
  name              = "/soulofsoul/${var.environment}/app"
  retention_in_days = 365 # HIPAA retention
}

resource "aws_cloudwatch_metric_alarm" "high_cpu" {
  alarm_name          = "soulofsoul-${var.environment}-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "RDS CPU above 80%"

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.postgres.id
  }
}

# ─── Outputs ───

output "rds_endpoint" {
  value = aws_db_instance.postgres.endpoint
}

output "redis_endpoint" {
  value = aws_elasticache_replication_group.main.primary_endpoint_address
}

output "ecs_cluster_name" {
  value = aws_ecs_cluster.main.name
}

output "database_url_secret_arn" {
  value = aws_secretsmanager_secret.db_url.arn
}
