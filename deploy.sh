#!/bin/bash

# Deployment script for Redemption App
# Usage: ./deploy.sh [option]
# Options:
#   full     - Full rebuild and restart (default)
#   env      - Just restart with new env vars
#   nginx    - Just reload nginx config
#   db       - Run database migrations
#   logs     - Show recent logs
#   status   - Show app status

set -e

APP_NAME="homelab-landing-nextjs"
APP_DIR="/var/www/homelab-landing-nextjs"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Full deployment
deploy_full() {
    echo -e "${GREEN}=== Full Deployment ===${NC}"
    cd "$APP_DIR"
    
    print_status "Installing dependencies..."
    npm install
    
    print_status "Building application..."
    npm run build
    
    print_status "Restarting PM2..."
    pm2 restart "$APP_NAME" --update-env
    
    print_status "Deployment complete!"
    pm2 status "$APP_NAME"
}

# Just restart with new env
deploy_env() {
    echo -e "${GREEN}=== Restarting with new environment ===${NC}"
    pm2 restart "$APP_NAME" --update-env
    print_status "Restart complete!"
}

# Reload nginx
deploy_nginx() {
    echo -e "${GREEN}=== Reloading Nginx ===${NC}"
    
    print_status "Testing nginx configuration..."
    sudo nginx -t
    
    print_status "Reloading nginx..."
    sudo systemctl reload nginx
    
    print_status "Nginx reloaded!"
}

# Database migrations
deploy_db() {
    echo -e "${GREEN}=== Running Database Migrations ===${NC}"
    cd "$APP_DIR"
    
    print_status "Running migrations..."
    npx prisma migrate deploy
    
    print_status "Generating Prisma client..."
    npx prisma generate
    
    print_status "Migrations complete!"
}

# Show logs
show_logs() {
    echo -e "${GREEN}=== Recent Logs ===${NC}"
    pm2 logs "$APP_NAME" --lines 30 --nostream
}

# Show status
show_status() {
    echo -e "${GREEN}=== App Status ===${NC}"
    pm2 status "$APP_NAME"
    echo ""
    echo -e "${GREEN}=== Health Check ===${NC}"
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8081)
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "307" ]; then
        print_status "App responding (HTTP $HTTP_CODE)"
    else
        print_error "App not responding correctly (HTTP $HTTP_CODE)"
    fi
}

# Main
case "${1:-full}" in
    full)
        deploy_full
        ;;
    env)
        deploy_env
        ;;
    nginx)
        deploy_nginx
        ;;
    db)
        deploy_db
        ;;
    logs)
        show_logs
        ;;
    status)
        show_status
        ;;
    *)
        echo "Usage: $0 {full|env|nginx|db|logs|status}"
        echo ""
        echo "Options:"
        echo "  full   - Full rebuild and restart (default)"
        echo "  env    - Just restart with new env vars"
        echo "  nginx  - Just reload nginx config"
        echo "  db     - Run database migrations"
        echo "  logs   - Show recent logs"
        echo "  status - Show app status"
        exit 1
        ;;
esac
