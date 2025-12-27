# Redemption App

A personal finance and account management dashboard built with Next.js 16, featuring authentication, document management, expense tracking, and more.

## Tech Stack

- **Framework**: Next.js 16.1.1 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Process Manager**: PM2
- **Reverse Proxy**: Nginx

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

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Nginx
- PM2 (`npm install -g pm2`)

## Quick Setup

### 1. Clone and Install

```bash
cd /var/www
git clone <your-repo-url> homelab-landing-nextjs
cd homelab-landing-nextjs
npm install
```

### 2. Configure Environment

Create `.env` file:

```bash
# Database
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/redemption?schema=public"

# Node environment
NODE_ENV="production"

# Auth - Generate a secure random string (32+ chars)
AUTH_SECRET="your-super-secret-auth-key-change-this"

# Trust reverse proxy
AUTH_TRUST_HOST=true

# Your app URL (with port if not 80/443)
AUTH_URL="http://YOUR_SERVER_IP:8081"
```

### 3. Setup PostgreSQL

```bash
# Create database
sudo -u postgres psql -c "CREATE DATABASE redemption;"

# Set password for postgres user (match your DATABASE_URL)
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'YOUR_PASSWORD';"
```

### 4. Run Database Migrations

```bash
npx prisma migrate deploy
```

### 5. Build the App

```bash
npm run build
```

### 6. Setup PM2

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Follow the instructions to enable auto-start
```

### 7. Setup Nginx

```bash
# Copy nginx config
sudo cp nginx-config.conf /etc/nginx/sites-available/homelab-landing

# Enable the site
sudo ln -sf /etc/nginx/sites-available/homelab-landing /etc/nginx/sites-enabled/

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

### 8. Verify

```bash
./deploy.sh status
```

Access at: `http://YOUR_SERVER_IP:8081`

## Deployment Script

Use the included `deploy.sh` script for easy management:

```bash
./deploy.sh full    # Full rebuild and restart (after code changes)
./deploy.sh env     # Restart with new env vars (after .env changes)
./deploy.sh nginx   # Reload nginx (after nginx config changes)
./deploy.sh db      # Run database migrations (after schema changes)
./deploy.sh logs    # View recent logs
./deploy.sh status  # Check app status
```

## Development

```bash
# Run in development mode
npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint

# Database commands
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema changes (dev only)
npm run db:migrate   # Create migration
npm run db:studio    # Open Prisma Studio
```

## Project Structure

```
├── actions/          # Server actions
├── app/              # Next.js App Router pages
│   ├── api/          # API routes
│   ├── accounts/     # Accounts page
│   ├── documents/    # Documents page
│   ├── finance/      # Finance page
│   ├── login/        # Login page
│   ├── register/     # Register page
│   ├── trash/        # Trash page
│   └── wishlist/     # Wishlist page
├── components/       # React components
├── lib/              # Utility functions & configs
├── prisma/           # Database schema & migrations
├── public/           # Static files
├── store/            # State management
└── types/            # TypeScript types
```

## Configuration Files

| File                   | Purpose                    |
| ---------------------- | -------------------------- |
| `.env`                 | Environment variables      |
| `ecosystem.config.js`  | PM2 configuration          |
| `nginx-config.conf`    | Nginx reverse proxy config |
| `prisma/schema.prisma` | Database schema            |
| `next.config.ts`       | Next.js configuration      |
| `tsconfig.json`        | TypeScript configuration   |

## Troubleshooting

### Check Logs

```bash
# PM2 logs
pm2 logs homelab-landing-nextjs --lines 50

# Nginx logs
sudo tail -f /var/log/nginx/homelab-landing-error.log
```

### Common Issues

**"UntrustedHost" error:**

- Ensure `AUTH_TRUST_HOST=true` is in `.env`
- Ensure `AUTH_URL` matches your actual URL with port

**Database connection failed:**

- Check PostgreSQL is running: `sudo systemctl status postgresql`
- Verify DATABASE_URL credentials
- Check if database exists: `sudo -u postgres psql -l`

**502 Bad Gateway:**

- Check if PM2 app is running: `pm2 status`
- Check if port 3000 is in use: `sudo ss -tlnp | grep 3000`

**After code changes, app not updating:**

- Run `./deploy.sh full` to rebuild

## Ports

| Service            | Port |
| ------------------ | ---- |
| Next.js (internal) | 3000 |
| Nginx (external)   | 8081 |
| PostgreSQL         | 5432 |

## License

Private - All rights reserved
.
