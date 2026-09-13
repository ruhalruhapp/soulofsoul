# Mini-service for crisis-relay — used by docker-compose
FROM oven/bun:1

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

CMD ["bun", "run", "dev"]
