# Redemption App

A personal finance and account management dashboard built with Next.js 16, featuring authentication, document management, expense tracking, and more.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start - Local Development](#quick-start---local-development)
- [Production Deployment (Linux/Ubuntu + Nginx)](#production-deployment-linuxubuntu--nginx)
- [Environment Variables Reference](#environment-variables-reference)
- [IP Addresses & Ports Configuration](#ip-addresses--ports-configuration)
- [Database Setup](#database-setup)
  - [Seeding the Database (Demo Data)](#seeding-the-database-demo-data)
- [Available Scripts](#available-scripts)
- [Deployment Script](#deployment-script)
- [Project Structure](#project-structure)
- [Configuration Files](#configuration-files)
- [Troubleshooting](#troubleshooting)

---

## Features

- 🔐 User authentication (register/login)
- 📧 Email & account management
- 💰 Finance tracking (income, expenses, debts, credits)
- 🏦 Bank account management
- 📄 Document storage
- 🎯 Wishlist management
- 🗑️ Soft delete with trash/restore
- 📊 Dashboard with charts
- 🔔 Notification system
- 📝 Audit logging

---

## Tech Stack

| Category        | Technology                  |
| --------------- | --------------------------- |
| Framework       | Next.js 16.1.1 (App Router) |
| Language        | TypeScript                  |
| Database        | PostgreSQL + Prisma ORM     |
| Authentication  | NextAuth.js v5              |
| Styling         | Tailwind CSS 4              |
| UI Components   | Radix UI                    |
| Process Manager | PM2 (production)            |
| Reverse Proxy   | Nginx (production)          |

---

## Prerequisites

### For Local Development

| Requirement   | Version | Notes                                     |
| ------------- | ------- | ----------------------------------------- |
| Node.js       | 18+     | Recommended: Use `nvm` to manage versions |
| PostgreSQL    | 14+     | Or use Docker (see below)                 |
| npm/yarn/pnpm | Latest  | npm comes with Node.js                    |

### For Production (Linux Server)

| Requirement | Version | Notes                             |
| ----------- | ------- | --------------------------------- |
| Node.js     | 18+     | Install via NodeSource repository |
| PostgreSQL  | 14+     | `apt install postgresql`          |
| PM2         | Latest  | `npm install -g pm2`              |
| Nginx       | Latest  | `apt install nginx`               |

---

## Quick Start - Local Development

### Step 1: Clone the Repository

```bash
git clone <your-repo-url> redemption
cd redemption
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
# ==============================================
# DATABASE
# ==============================================
DATABASE_URL="postgresql://postgres:password@localhost:5432/redemption?schema=public"

# ==============================================
# NODE ENVIRONMENT
# ==============================================
NODE_ENV="development"

# ==============================================
# AUTHENTICATION (NextAuth.js)
# ==============================================
# Generate a secure random string (32+ characters)
# Run: openssl rand -base64 32
AUTH_SECRET="your-super-secret-auth-key-minimum-32-characters"

# For local development
AUTH_URL="http://localhost:3000"

# Trust proxy headers (needed when behind reverse proxy)
AUTH_TRUST_HOST=true
```

### Step 4: Set Up PostgreSQL

**Option A: Local PostgreSQL Installation**

```bash
# Windows (using psql)
psql -U postgres
CREATE DATABASE redemption;
\q

# macOS (using Homebrew)
brew install postgresql
brew services start postgresql
createdb redemption

# Linux
sudo -u postgres createdb redemption
```

**Option B: Using Docker**

```bash
docker run --name redemption-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=redemption \
  -p 5432:5432 \
  -d postgres:14
```

### Step 5: Run Database Migrations

```bash
# Push schema to database (development)
npm run db:push

# Or run migrations (recommended for existing databases)
npm run db:migrate
```

### Step 6: (Optional) Seed Demo Data

To start with pre-populated demo data:

```bash
npm run db:seed
```

This creates a demo user and sample data for all features. See [Seeding the Database](#seeding-the-database-demo-data) for details.

**Demo Login:**

- Username: `demo`
- Password: `pa$$word`

### Step 7: Start the Development Server

```bash
npm run dev
```

**🎉 App is now running at: http://localhost:3000**

---

## Production Deployment (Linux/Ubuntu + Nginx)

### Architecture Overview

```
Internet → Nginx (Port 8081) → Next.js/PM2 (Port 3000) → PostgreSQL (Port 5432)
```

### Step 1: Prepare the Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+ (via NodeSource)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib
```

### Step 2: Clone and Install

```bash
# Create app directory
sudo mkdir -p /var/www/homelab-landing-nextjs
sudo chown $USER:$USER /var/www/homelab-landing-nextjs

# Clone repository
cd /var/www
git clone <your-repo-url> homelab-landing-nextjs
cd homelab-landing-nextjs

# Install dependencies
npm install
```

### Step 3: Configure Environment

Create `.env` file:

```bash
# ==============================================
# DATABASE
# ==============================================
DATABASE_URL="postgresql://redemption_user:YOUR_SECURE_PASSWORD@localhost:5432/redemption?schema=public"

# ==============================================
# NODE ENVIRONMENT
# ==============================================
NODE_ENV="production"

# ==============================================
# AUTHENTICATION (NextAuth.js)
# ==============================================
AUTH_SECRET="your-super-secret-auth-key-minimum-32-characters"

# IMPORTANT: Use your server's IP or domain with the Nginx port
AUTH_URL="http://YOUR_SERVER_IP:8081"

# Trust Nginx proxy headers
AUTH_TRUST_HOST=true
```

**Generate a secure AUTH_SECRET:**

```bash
openssl rand -base64 32
```

### Step 4: Set Up PostgreSQL Database

```bash
# Switch to postgres user
sudo -u postgres psql

# Run these SQL commands:
CREATE DATABASE redemption;
CREATE USER redemption_user WITH ENCRYPTED PASSWORD 'YOUR_SECURE_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE redemption TO redemption_user;
\c redemption
GRANT ALL ON SCHEMA public TO redemption_user;
\q
```

### Step 5: Run Database Migrations

```bash
cd /var/www/homelab-landing-nextjs
npm run db:migrate:deploy
```

### Step 6: Build the Application

```bash
npm run build
```

### Step 7: Configure PM2

The `ecosystem.config.js` file is already configured:

```javascript
module.exports = {
  apps: [
    {
      name: "homelab-landing-nextjs",
      script: "npm",
      args: "start",
      cwd: "/var/www/homelab-landing-nextjs",
      env: {
        NODE_ENV: "production",
        PORT: 3000, // ← Internal port (change here if needed)
      },
    },
  ],
};
```

**Start the app:**

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Follow the output instructions
```

### Step 8: Configure Nginx

**Copy the config file:**

```bash
sudo cp nginx-config.conf /etc/nginx/sites-available/homelab-landing
sudo ln -sf /etc/nginx/sites-available/homelab-landing /etc/nginx/sites-enabled/
```

**Test and reload:**

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Step 9: Verify Deployment

```bash
./deploy.sh status
```

**🎉 App is now running at: http://YOUR_SERVER_IP:8081**

---

## Environment Variables Reference

| Variable          | Required | Default       | Description                                     |
| ----------------- | -------- | ------------- | ----------------------------------------------- |
| `DATABASE_URL`    | ✅       | -             | PostgreSQL connection string                    |
| `NODE_ENV`        | ❌       | `development` | `development`, `production`, or `test`          |
| `AUTH_SECRET`     | ✅       | -             | Secret key for NextAuth.js (min 32 characters)  |
| `AUTH_URL`        | ✅       | -             | Full URL where app is accessible (include port) |
| `AUTH_TRUST_HOST` | ❌       | `false`       | Set to `true` when behind reverse proxy (Nginx) |

### DATABASE_URL Format

```
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE?schema=public
```

**Examples:**

```bash
# Local development
DATABASE_URL="postgresql://postgres:password@localhost:5432/redemption?schema=public"

# Production with custom user
DATABASE_URL="postgresql://redemption_user:SecureP@ss123@localhost:5432/redemption?schema=public"

# Remote database
DATABASE_URL="postgresql://admin:password@192.168.1.100:5432/redemption?schema=public"
```

---

## IP Addresses & Ports Configuration

### Default Port Configuration

| Service                  | Default Port | Config File           | How to Change              |
| ------------------------ | ------------ | --------------------- | -------------------------- |
| Next.js Dev Server       | `3000`       | Built-in              | `npm run dev -- -p 4000`   |
| Next.js Production (PM2) | `3000`       | `ecosystem.config.js` | Edit `PORT` in env section |
| Nginx (External Access)  | `8081`       | `nginx-config.conf`   | Edit `listen` directive    |
| PostgreSQL               | `5432`       | PostgreSQL config     | Edit `DATABASE_URL`        |

### Changing the Development Port

```bash
# Run on a different port
npm run dev -- -p 4000
# App will be at http://localhost:4000
```

### Changing the Production Internal Port (PM2)

Edit `ecosystem.config.js`:

```javascript
env: {
  NODE_ENV: "production",
  PORT: 4000,  // ← Change this
},
```

Then update Nginx to proxy to the new port.

### Changing the External Port (Nginx)

Edit `nginx-config.conf`:

```nginx
server {
    listen 9000;              # ← Change external port
    listen [::]:9000;         # ← Change for IPv6

    location / {
        proxy_pass http://localhost:3000;  # ← Must match PM2 port
        # ...
    }
}
```

**After changing, reload Nginx:**

```bash
sudo nginx -t
sudo systemctl reload nginx
```

**Don't forget to update `.env`:**

```bash
AUTH_URL="http://YOUR_SERVER_IP:9000"
```

### Binding to Specific IP Addresses

**Nginx - Listen on specific IP:**

```nginx
server {
    listen 192.168.1.50:8081;    # Only accessible on this IP
    # or
    listen 0.0.0.0:8081;         # Listen on all interfaces (default)
    # or
    listen 127.0.0.1:8081;       # Only localhost (for testing)
}
```

### Firewall Configuration (UFW)

```bash
# Allow the Nginx port
sudo ufw allow 8081/tcp

# Or for a different port
sudo ufw allow 9000/tcp

# Check status
sudo ufw status
```

### Port Summary Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        YOUR SERVER                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐    │
│  │   NGINX      │     │   NEXT.JS    │     │  POSTGRESQL  │    │
│  │              │     │    (PM2)     │     │              │    │
│  │  Port: 8081  │────▶│  Port: 3000  │────▶│  Port: 5432  │    │
│  │  (External)  │     │  (Internal)  │     │  (Internal)  │    │
│  └──────────────┘     └──────────────┘     └──────────────┘    │
│         ▲                                                       │
└─────────┼───────────────────────────────────────────────────────┘
          │
     Internet
     (Users access via YOUR_IP:8081)
```

---

## Database Setup

### Quick Setup (PostgreSQL)

**Linux (Ubuntu/Debian):**

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start & enable on boot
sudo systemctl enable postgresql
sudo systemctl start postgresql

# Create database and user
sudo -u postgres psql

# Inside psql:
CREATE DATABASE redemption;
CREATE USER redemption_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE redemption TO redemption_user;
\c redemption
GRANT ALL ON SCHEMA public TO redemption_user;
\q
```

**macOS (Homebrew):**

```bash
brew install postgresql
brew services start postgresql
createdb redemption
```

**Windows:**

1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Run installer and set password for `postgres` user
3. Open pgAdmin or psql and create `redemption` database

### Using Docker for PostgreSQL

```bash
# Start PostgreSQL container
docker run -d \
  --name redemption-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=redemption \
  -p 5432:5432 \
  -v redemption_data:/var/lib/postgresql/data \
  postgres:14

# Connection string for .env
DATABASE_URL="postgresql://postgres:password@localhost:5432/redemption?schema=public"
```

### Database Commands

```bash
# Generate Prisma client (after schema changes)
npm run db:generate

# Push schema to database (development only)
npm run db:push

# Create a new migration
npm run db:migrate

# Apply migrations (production)
npm run db:migrate:deploy

# Reset database (WARNING: deletes all data)
npm run db:reset

# Open Prisma Studio (GUI)
npm run db:studio

# Seed database with initial data
npm run db:seed
```

### Seeding the Database (Demo Data)

The seed script creates a complete demo dataset to help you get started quickly. Run it after setting up the database:

```bash
npm run db:seed
```

**Demo User Credentials:**

| Field    | Value              |
| -------- | ------------------ |
| Username | `demo`             |
| Password | `pa$$word`         |
| Email    | `demo@example.com` |

**What Gets Created:**

| Entity             | Count | Examples                                          |
| ------------------ | ----- | ------------------------------------------------- |
| User               | 1     | Demo account with all plugins enabled             |
| Emails             | 3     | Gmail (primary), Outlook (work), TempMail         |
| Accounts           | 8     | Netflix, Spotify, GitHub, AWS, Adobe, Steam, etc. |
| Banks              | 4     | Volksbank, Sparkasse, VISA Card, PayPal           |
| Incomes            | 4     | Salary, Freelance, Dividends, SaaS side project   |
| Debts              | 3     | Car loan, Student loan, Personal loan             |
| Credits            | 3     | VISA, Amazon Card, PayPal Credit                  |
| Recurring Expenses | 12    | Rent, Utilities, Subscriptions, Loan payments     |
| One-time Bills     | 5     | Car registration, Dentist, Vacation flights       |
| Wishlist Items     | 7     | Headphones, Standing desk, PS5, Monitor, etc.     |
| Notifications      | 5     | Bill reminders, Low balance alerts                |
| Section Timestamps | 6     | Last updated timestamps for each section          |
| Audit Logs         | 3     | Sample create/update logs                         |

> ⚠️ **Warning:** Running `npm run db:seed` will **delete all existing data** before inserting demo data.

---

## Available Scripts

| Script              | Command                     | Description                               |
| ------------------- | --------------------------- | ----------------------------------------- |
| `dev`               | `npm run dev`               | Start development server (localhost:3000) |
| `build`             | `npm run build`             | Build for production                      |
| `start`             | `npm run start`             | Start production server                   |
| `lint`              | `npm run lint`              | Run ESLint                                |
| `typecheck`         | `npm run typecheck`         | Run TypeScript type checking              |
| `db:generate`       | `npm run db:generate`       | Generate Prisma client                    |
| `db:push`           | `npm run db:push`           | Push schema to database (dev)             |
| `db:migrate`        | `npm run db:migrate`        | Create new migration                      |
| `db:migrate:deploy` | `npm run db:migrate:deploy` | Apply migrations (production)             |
| `db:studio`         | `npm run db:studio`         | Open Prisma Studio GUI                    |
| `db:reset`          | `npm run db:reset`          | Reset database (deletes data!)            |
| `db:seed`           | `npm run db:seed`           | Seed database with initial data           |

---

## Deployment Script

The `deploy.sh` script simplifies production management:

```bash
# Make executable (first time only)
chmod +x deploy.sh

# Usage
./deploy.sh [option]
```

| Option   | Description                                | When to Use                        |
| -------- | ------------------------------------------ | ---------------------------------- |
| `full`   | Full rebuild: install, build, restart      | After pulling new code             |
| `env`    | Restart app with new environment variables | After changing `.env`              |
| `nginx`  | Reload Nginx configuration                 | After changing `nginx-config.conf` |
| `db`     | Run database migrations                    | After schema changes               |
| `logs`   | Show last 30 log lines                     | Debugging                          |
| `status` | Check app status and health                | Verify deployment                  |

**Examples:**

```bash
# After git pull with new code
./deploy.sh full

# After updating .env file
./deploy.sh env

# Check if everything is running
./deploy.sh status

# View recent errors
./deploy.sh logs
```

---

## Project Structure

```
redemption/
├── actions/              # Server actions (form handling, mutations)
├── app/                  # Next.js App Router
│   ├── api/              # API routes
│   ├── accounts/         # Accounts management page
│   ├── documents/        # Document storage page
│   ├── finance/          # Finance tracking page
│   ├── login/            # Login page
│   ├── register/         # Registration page
│   ├── trash/            # Trash/restore page
│   ├── wishlist/         # Wishlist page
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Homepage (dashboard)
│   └── globals.css       # Global styles
├── components/           # React components (by feature)
│   ├── accounts/         # Account-related components
│   ├── auth/             # Authentication components
│   ├── charts/           # Chart components
│   ├── dashboard/        # Dashboard components
│   ├── documents/        # Document components
│   ├── finance/          # Finance components
│   ├── ui/               # Shared UI components (shadcn)
│   └── ...
├── data/                 # Static/mock data
├── lib/                  # Utility functions & business logic
│   ├── validations/      # Zod schemas
│   └── *.ts              # Helper functions
├── prisma/               # Database
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Migration files
├── public/               # Static assets
├── store/                # Client-side state management
├── types/                # TypeScript type definitions
├── auth.ts               # NextAuth.js configuration
├── ecosystem.config.js   # PM2 configuration
├── nginx-config.conf     # Nginx configuration
├── deploy.sh             # Deployment helper script
└── package.json          # Dependencies & scripts
```

---

## Configuration Files

| File                   | Purpose                      | When to Edit                        |
| ---------------------- | ---------------------------- | ----------------------------------- |
| `.env`                 | Environment variables        | Database, auth, URLs                |
| `ecosystem.config.js`  | PM2 process manager settings | Change internal port, memory limits |
| `nginx-config.conf`    | Nginx reverse proxy          | Change external port, SSL, domains  |
| `prisma/schema.prisma` | Database schema              | Add/modify database tables          |
| `next.config.ts`       | Next.js settings             | Add redirects, rewrites, env vars   |
| `tsconfig.json`        | TypeScript configuration     | Path aliases, compiler options      |
| `tailwind.config.ts`   | Tailwind CSS theme           | Colors, fonts, breakpoints          |

---

## Troubleshooting

### View Logs

```bash
# PM2 application logs
pm2 logs homelab-landing-nextjs --lines 50

# Nginx access logs
sudo tail -f /var/log/nginx/homelab-landing-access.log

# Nginx error logs
sudo tail -f /var/log/nginx/homelab-landing-error.log

# PostgreSQL logs (Ubuntu)
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

### Common Issues

#### ❌ "UntrustedHost" Error

**Cause:** NextAuth.js doesn't trust the host making the request.

**Fix:**

1. Ensure `.env` has these settings:
   ```bash
   AUTH_TRUST_HOST=true
   AUTH_URL="http://YOUR_SERVER_IP:8081"  # Must match actual URL
   ```
2. Restart the app: `./deploy.sh env`

#### ❌ Database Connection Failed

**Check PostgreSQL is running:**

```bash
sudo systemctl status postgresql
```

**Verify credentials:**

```bash
sudo -u postgres psql -c "\l"  # List databases
sudo -u postgres psql -c "\du" # List users
```

**Test connection:**

```bash
psql "postgresql://redemption_user:password@localhost:5432/redemption"
```

#### ❌ 502 Bad Gateway

**Cause:** Nginx can't reach the Next.js app.

**Check PM2 status:**

```bash
pm2 status
```

**Check if port 3000 is in use:**

```bash
sudo ss -tlnp | grep 3000
```

**Check PM2 logs:**

```bash
pm2 logs homelab-landing-nextjs --lines 50
```

#### ❌ App Not Updating After Code Changes

**Solution:** Run a full rebuild:

```bash
./deploy.sh full
```

#### ❌ Permission Denied on deploy.sh

```bash
chmod +x deploy.sh
```

#### ❌ Port Already in Use

```bash
# Find what's using port 3000
sudo lsof -i :3000

# Kill the process
sudo kill -9 <PID>

# Or change the port in ecosystem.config.js
```

#### ❌ Can't Access from External Network

1. **Check firewall:**

   ```bash
   sudo ufw status
   sudo ufw allow 8081/tcp
   ```

2. **Check Nginx is listening on all interfaces:**

   ```nginx
   listen 0.0.0.0:8081;
   ```

3. **Check router/cloud firewall** (AWS Security Groups, etc.)

---

## License

This project is licensed under the **Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License (CC BY-NC-SA 4.0)**.

[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

### You are free to:

- ✅ **Use** — for personal, educational, or non-commercial purposes
- ✅ **Share** — copy and redistribute
- ✅ **Adapt** — fork, modify, and build upon

### Under these conditions:

- 📝 **Attribution** — You must give appropriate credit
- 🚫 **NonCommercial** — You may NOT use this for commercial purposes or sell it
- 🔄 **ShareAlike** — Derivatives must use the same license

See [LICENSE](LICENSE) for full details.

> **Note:** Third-party dependencies (Next.js, PostgreSQL, Prisma, etc.) are licensed under their own respective open-source licenses.
