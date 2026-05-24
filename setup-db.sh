#!/bin/bash
# ============================================================
# BookYourService - PostgreSQL Database Setup Script
# ============================================================
# This script helps you set up a PostgreSQL database for the project.
#
# Option 1: Use Neon (Free, Serverless PostgreSQL)
#   1. Go to https://neon.tech and create a free account
#   2. Create a new project named "bookyourservice"
#   3. Copy the connection string from the dashboard
#   4. Set it in your .env file:
#      DATABASE_URL=postgres://username:password@ep-xxx.region.aws.neon.tech/bookyourservice?sslmode=require
#   5. Run: bun run db:push
#   6. Run: bun run db:seed
#
# Option 2: Use Supabase (Free PostgreSQL)
#   1. Go to https://supabase.com and create a free project
#   2. Go to Project Settings > Database
#   3. Copy the connection string (URI format)
#   4. Set it in your .env file
#   5. Run: bun run db:push
#   6. Run: bun run db:seed
#
# Option 3: Local PostgreSQL
#   1. Install PostgreSQL on your system
#   2. Create database: createdb bookyourservice
#   3. Set DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bookyourservice
#   4. Run: bun run db:push
#   5. Run: bun run db:seed
# ============================================================

set -e

echo "🔧 BookYourService - PostgreSQL Setup"
echo "======================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
  echo "❌ No .env file found. Creating one..."
  cp .env.example .env
  echo "✅ Created .env file. Please update DATABASE_URL with your PostgreSQL connection string."
  exit 1
fi

# Check if DATABASE_URL is set
if grep -q "DATABASE_URL=postgresql://postgres:postgres@localhost" .env; then
  echo "⚠️  DATABASE_URL is still set to default localhost."
  echo "   Please update .env with your actual PostgreSQL connection string."
  echo ""
  echo "   Free options:"
  echo "   • Neon:      https://neon.tech (Free tier, instant setup)"
  echo "   • Supabase:  https://supabase.com (Free PostgreSQL)"
  echo "   • Railway:   https://railway.app (Free tier available)"
  echo ""
  read -p "   Enter your PostgreSQL connection string (or press Enter to skip): " DB_URL
  if [ -n "$DB_URL" ]; then
    sed -i "s|DATABASE_URL=.*|DATABASE_URL=$DB_URL|" .env
    echo "✅ Updated DATABASE_URL in .env"
  else
    echo "⚠️  Skipping. Please update .env manually before running db:push"
    exit 0
  fi
fi

echo ""
echo "📦 Pushing database schema..."
npx prisma db push

echo ""
echo "🌱 Seeding database..."
bun run db:seed

echo ""
echo "✅ Database setup complete!"
echo "   Your PostgreSQL database is ready with all tables and seed data."
