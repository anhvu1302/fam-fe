# FAM Frontend Makefile

DOCKER_IMAGE=fam-fe
DOCKER_TAG=latest
CONTAINER_NAME=fam-fe
PORT=8001
ENV_FILE=.env

# Load environment variables
ifneq (,$(wildcard $(ENV_FILE)))
    include $(ENV_FILE)
    export
endif

.PHONY: help build run stop restart logs clean
.PHONY: docker-build docker-clean
.PHONY: prod-deploy prod-start prod-stop prod-restart prod-logs prod-status prod-down prod-health

help:
	@echo "======================================"
	@echo "FAM Frontend Tool"
	@echo "======================================"
	@echo ""
	@echo "🐳 Docker:"
	@echo "  docker-build       Build production image"
	@echo "  docker-clean       Clean images and cache"
	@echo ""
	@echo "🚀 Production:"
	@echo "  prod-deploy        Deploy to production"
	@echo "  prod-start         Start services"
	@echo "  prod-stop          Stop services"
	@echo "  prod-restart       Restart services"
	@echo "  prod-logs          View logs"
	@echo "  prod-status        Check status"
	@echo "  prod-health        Health check"
	@echo "  prod-down          Stop and remove containers"
	@echo ""
	@echo "📦 Development:"
	@echo "  build              Build Docker image (alias)"
	@echo "  run                Run container (alias)"
	@echo "  stop               Stop container (alias)"
	@echo "  restart            Restart container (alias)"
	@echo "  logs               View logs (alias)"
	@echo "  clean              Clean up (alias)"

# ============================================
# Docker Targets
# ============================================

docker-build:
	@echo "🐳 Building Docker image..."
	docker build -t $(DOCKER_IMAGE):$(DOCKER_TAG) .
	@echo "✅ Build completed!"
	@docker images $(DOCKER_IMAGE):$(DOCKER_TAG) --format "Size: {{.Size}}"

docker-clean:
	@echo "🧹 Cleaning project images..."
	@docker rmi $(DOCKER_IMAGE):$(DOCKER_TAG) 2>/dev/null || true
	@docker images -f "dangling=true" -q | grep -q . && docker rmi $$(docker images -f "dangling=true" -q) 2>/dev/null || true
	@echo "✅ Done!"

# ============================================
# Production Targets
# ============================================

prod-deploy: docker-build
	@echo "🚀 Deploying..."
	@if [ ! -f "$(ENV_FILE)" ]; then echo "❌ $(ENV_FILE) not found"; exit 1; fi
	docker compose -f docker-compose.yml --env-file $(ENV_FILE) up -d
	@sleep 3
	@make prod-health

prod-build:
	docker compose -f docker-compose.yml --env-file $(ENV_FILE) build

prod-start:
	docker compose -f docker-compose.yml --env-file $(ENV_FILE) start

prod-stop:
	docker compose -f docker-compose.yml --env-file $(ENV_FILE) stop

prod-restart:
	docker compose -f docker-compose.yml --env-file $(ENV_FILE) restart

prod-logs:
	docker compose -f docker-compose.yml --env-file $(ENV_FILE) logs -f $(CONTAINER_NAME)

prod-status:
	docker compose -f docker-compose.yml --env-file $(ENV_FILE) ps

prod-down:
	docker compose -f docker-compose.yml --env-file $(ENV_FILE) down

prod-health:
	@echo "🏥 Health check..."
	@echo "Frontend:" && curl -sf http://localhost:$(PORT) > /dev/null && echo "  ✅" || echo "  ❌"

# ============================================
# Development Aliases
# ============================================

build: docker-build

run: prod-start

stop: prod-stop

restart: prod-restart

logs: prod-logs

clean: docker-clean
