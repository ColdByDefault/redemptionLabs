#!/bin/bash

# Homelab Landing Page - Next.js Deployment Script
# This script deploys the Next.js app to your Ubuntu server

set -e

echo "==================================="
echo "Deploying Homelab Landing Page"
echo "==================================="

# Configuration
DEPLOY_DIR="/var/www/homelab-landing-nextjs"
BACKUP_DIR="/var/www/homelab-landing-nextjs-backup"
APP_NAME="homelab-landing-nextjs"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}PM2 is not installed. Installing PM2...${NC}"
    sudo npm install -g pm2
fi

# Create backup of current deployment if it exists
if [ -d "$DEPLOY_DIR" ]; then
    echo -e "${YELLOW}Creating backup of current deployment...${NC}"
    sudo rm -rf "$BACKUP_DIR"
    sudo cp -r "$DEPLOY_DIR" "$BACKUP_DIR"
    echo -e "${GREEN}Backup created at $BACKUP_DIR${NC}"
fi

# Create deployment directory if it doesn't exist
echo -e "${YELLOW}Preparing deployment directory...${NC}"
sudo mkdir -p "$DEPLOY_DIR"

# Copy files to deployment directory
echo -e "${YELLOW}Copying files to $DEPLOY_DIR...${NC}"
sudo rsync -av --exclude='node_modules' --exclude='.next' --exclude='.git' \
    ./ "$DEPLOY_DIR/"

# Set ownership to current user
echo -e "${YELLOW}Setting permissions...${NC}"
sudo chown -R $USER:$USER "$DEPLOY_DIR"

# Change to deployment directory
cd "$DEPLOY_DIR"

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install --production=false

# Build the Next.js app
echo -e "${YELLOW}Building Next.js application...${NC}"
npm run build

# Create PM2 log directory if it doesn't exist
sudo mkdir -p /var/log/pm2

# Stop PM2 app if it's running
if pm2 list | grep -q "$APP_NAME"; then
    echo -e "${YELLOW}Stopping existing PM2 process...${NC}"
    pm2 delete "$APP_NAME"
fi

# Start the app with PM2
echo -e "${YELLOW}Starting application with PM2...${NC}"
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Setup PM2 to run on system startup
pm2 startup systemd -u $USER --hp $HOME

echo -e "${GREEN}==================================="
echo -e "Deployment completed successfully!"
echo -e "===================================${NC}"
echo ""
echo -e "Application: ${GREEN}$APP_NAME${NC}"
echo -e "Location: ${GREEN}$DEPLOY_DIR${NC}"
echo -e "Port: ${GREEN}3000${NC}"
echo ""
echo "Useful PM2 commands:"
echo "  pm2 status              - Check app status"
echo "  pm2 logs $APP_NAME      - View logs"
echo "  pm2 restart $APP_NAME   - Restart app"
echo "  pm2 stop $APP_NAME      - Stop app"
echo "  pm2 monit               - Monitor resources"
echo ""
echo "Next step: Update nginx configuration and reload nginx"
echo "  sudo nano /etc/nginx/sites-available/homelab-landing"
echo "  sudo nginx -t"
echo "  sudo systemctl reload nginx"
