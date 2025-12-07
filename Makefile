# FAM Frontend Makefile - Smart Cache Edition

DOCKER_IMAGE=fam-fe
DOCKER_TAG=latest
CONTAINER_NAME=fam-fe
PORT=8001
ENV_FILE=.env

# Lấy timestamp để làm cache buster
NOW := $(shell date +%s)

# Load environment variables
ifneq (,$(wildcard $(ENV_FILE)))
    include $(ENV_FILE)
    export
endif

.PHONY: help build run stop restart logs clean
.PHONY: prod-deploy prod-start prod-stop prod-restart prod-logs prod-status prod-down prod-health

help:
	@echo "======================================"
	@echo "FAM Frontend Tool"
	@echo "======================================"
	@echo "🚀 Production:"
	@echo "  make prod-deploy     : Deploy mới (Smart Cache)"
	@echo "  make prod-logs       : Xem log realtime"
	@echo "  make prod-status     : Xem trạng thái container"

# ============================================
# Production Targets
# ============================================

prod-deploy: 
	@echo "🚀 [1/4] Building image (Smart Cache)..."
	docker compose -f docker-compose.yml --env-file $(ENV_FILE) build --build-arg CACHEBUST=$(NOW)
	
	@echo "🛑 [2/4] Restarting container..."
	docker compose -f docker-compose.yml --env-file $(ENV_FILE) down --remove-orphans
	docker compose -f docker-compose.yml --env-file $(ENV_FILE) up -d --force-recreate
	
	@echo "🧹 [3/4] Cleaning old images..."
	@docker image prune -f
	
	@echo "⏳ [4/4] Waiting 15s for Next.js to boot..."
	@# [FIX] Tăng thời gian chờ lên 15s để server kịp khởi động
	@sleep 5
	@make prod-health

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
	@echo "🏥 Checking Health (http://localhost:$(PORT))..."
	@if command -v curl >/dev/null 2>&1; then \
		curl -sf http://localhost:$(PORT) > /dev/null && echo "  ✅ Frontend is UP & READY" || echo "  ❌ Frontend check FAILED (Try checking logs: make prod-logs)"; \
	else \
		echo "  ⚠️ curl not found, skipping check"; \
	fi

# ============================================
# Development Aliases
# ============================================

docker-clean:
	@docker rmi $(DOCKER_IMAGE):$(DOCKER_TAG) 2>/dev/null || true
	@docker image prune -f

build: 
	docker compose build