#!/bin/bash
# Deploy soulofsoul to AWS via Terraform
#
# Usage:
#   ./deploy/scripts/deploy-aws.sh <environment>
#
# Prerequisites:
#   - AWS CLI configured
#   - Terraform >= 1.5
#   - Secrets in AWS Secrets Manager

set -euo pipefail

ENV="${1:-production}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "🚀 Deploying soulofsoul to AWS ($ENV environment)"
echo ""

# Check prerequisites
if ! command -v terraform &> /dev/null; then
  echo "❌ Terraform not installed. Install from https://terraform.io"
  exit 1
fi

if ! command -v aws &> /dev/null; then
  echo "❌ AWS CLI not installed."
  exit 1
fi

# Verify AWS credentials
aws sts get-caller-identity > /dev/null 2>&1 || {
  echo "❌ AWS credentials not configured. Run 'aws configure' first."
  exit 1
}

cd "$PROJECT_DIR/deploy/aws"

# Initialize Terraform
echo "📦 Initializing Terraform..."
terraform init -upgrade

# Plan
echo ""
echo "📋 Generating plan..."
DB_PASSWORD=$(aws secretsmanager get-secret-value --secret-id soulofsoul/$ENV/db-password --query SecretString --output text 2>/dev/null || echo "")
NEXTAUTH_SECRET=$(aws secretsmanager get-secret-value --secret-id soulofsoul/$ENV/nextauth-secret --query SecretString --output text 2>/dev/null || echo "")
ZAI_API_KEY=$(aws secretsmanager get-secret-value --secret-id soulofsoul/$ENV/zai-api-key --query SecretString --output text 2>/dev/null || echo "")

if [ -z "$DB_PASSWORD" ] || [ -z "$NEXTAUTH_SECRET" ] || [ -z "$ZAI_API_KEY" ]; then
  echo "⚠️  Some secrets not found in Secrets Manager."
  echo "   Create them with:"
  echo "   aws secretsmanager create-secret --name soulofsoul/$ENV/db-password --secret-string '...'"
  echo "   aws secretsmanager create-secret --name soulofsoul/$ENV/nextauth-secret --secret-string '...'"
  echo "   aws secretsmanager create-secret --name soulofsoul/$ENV/zai-api-key --secret-string '...'"
  echo ""
  echo "   Then re-run this script."
  exit 1
fi

terraform plan \
  -var-file="${ENV}.tfvars" \
  -var "database_password=$DB_PASSWORD" \
  -var "nextauth_secret=$NEXTAUTH_SECRET" \
  -var "zai_api_key=$ZAI_API_KEY" \
  -out="tfplan"

echo ""
read -p "Apply this plan? (yes/no) " -r
if [[ ! $REPLY =~ ^[Yy]es$ ]]; then
  echo "Cancelled."
  rm -f tfplan
  exit 0
fi

# Apply
echo ""
echo "🚀 Applying..."
terraform apply tfplan

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Outputs:"
terraform output

rm -f tfplan
