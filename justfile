# Wakeup Monorepo Commands

# Default command - show available commands
default:
    @just --list

# Install all dependencies
install:
    pnpm install

# === Infrastructure Commands ===

# Start infrastructure (Postgres + MinIO)
infra-up:
    docker compose -f infra/docker-compose.yml up -d

# Stop infrastructure
infra-down:
    docker compose -f infra/docker-compose.yml down

# Reset infrastructure (remove volumes)
infra-reset:
    docker compose -f infra/docker-compose.yml down -v
    docker compose -f infra/docker-compose.yml up -d

# View infrastructure logs
infra-logs:
    docker compose -f infra/docker-compose.yml logs -f

# === Database Commands ===

# Run database migrations up
migrate-up:
    docker exec -i wakeup-postgres psql -U wakeup -d wakeup < apps/api/db/migrations/000001_create_profiles.up.sql
    docker exec -i wakeup-postgres psql -U wakeup -d wakeup < apps/api/db/migrations/000002_create_refresh_tokens.up.sql
    docker exec -i wakeup-postgres psql -U wakeup -d wakeup < apps/api/db/migrations/000003_create_focus_sessions.up.sql
    docker exec -i wakeup-postgres psql -U wakeup -d wakeup < apps/api/db/migrations/000004_create_block_rules.up.sql
    docker exec -i wakeup-postgres psql -U wakeup -d wakeup < apps/api/db/migrations/000005_create_files.up.sql
    docker exec -i wakeup-postgres psql -U wakeup -d wakeup < apps/api/db/migrations/000006_create_extension_codes.up.sql

# Run database migrations down
migrate-down:
    docker exec -i wakeup-postgres psql -U wakeup -d wakeup < apps/api/db/migrations/000006_create_extension_codes.down.sql
    docker exec -i wakeup-postgres psql -U wakeup -d wakeup < apps/api/db/migrations/000005_create_files.down.sql
    docker exec -i wakeup-postgres psql -U wakeup -d wakeup < apps/api/db/migrations/000004_create_block_rules.down.sql
    docker exec -i wakeup-postgres psql -U wakeup -d wakeup < apps/api/db/migrations/000003_create_focus_sessions.down.sql
    docker exec -i wakeup-postgres psql -U wakeup -d wakeup < apps/api/db/migrations/000002_create_refresh_tokens.down.sql
    docker exec -i wakeup-postgres psql -U wakeup -d wakeup < apps/api/db/migrations/000001_create_profiles.down.sql

# Reset database (down + up)
migrate-reset:
    just migrate-down
    just migrate-up

# Connect to database
db:
    docker exec -it wakeup-postgres psql -U wakeup -d wakeup

# === Code Generation ===

# Generate TypeScript API client from OpenAPI spec
gen-client:
    pnpm --filter @wakeup/api-client generate

# === Development Commands ===

# Start the Go API server
dev-api:
    cd apps/api && go run ./cmd/api

# Start the web app
dev-web:
    pnpm --filter web dev

# Start the marketing site
dev-marketing:
    pnpm --filter marketing dev

# Start the mobile app (placeholder)
dev-mobile:
    pnpm --filter mobile dev

# Build the Chrome extension
build-extension:
    pnpm --filter wakeup-extension build

# Watch/dev the Chrome extension
dev-extension:
    pnpm --filter wakeup-extension dev

# === Combined Commands ===

# Start everything for development (infra + api + web)
dev: infra-up
    #!/usr/bin/env bash
    trap 'kill $(jobs -p)' EXIT
    just dev-api &
    sleep 2
    just dev-web &
    wait

# Start all services including marketing
dev-all: infra-up
    #!/usr/bin/env bash
    trap 'kill $(jobs -p)' EXIT
    just dev-api &
    sleep 2
    just dev-web &
    just dev-marketing &
    wait

# === Build & Quality Commands ===

# Run linting
lint:
    pnpm -r lint

# Run type checking
typecheck:
    pnpm -r typecheck

# Build all packages
build:
    pnpm -r build
