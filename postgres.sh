# 1. Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# 2. Start & enable on boot
sudo systemctl enable postgresql
sudo systemctl start postgresql

# 3. Create database and user
sudo -u postgres psql

# Inside psql, run:
CREATE DATABASE redemption;
CREATE USER redemption_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE redemption TO redemption_user;
\c redemption
GRANT ALL ON SCHEMA public TO redemption_user;
\q

# 4. Update your .env with the password you chose
# DATABASE_URL="postgresql://redemption_user:your_secure_password@localhost:5432/redemption?schema=public"

# 5. Then run migrations
npm run db:push
npm run db:seed