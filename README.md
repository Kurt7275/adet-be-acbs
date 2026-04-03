# ACBS - Backend

Hono + Prisma + MySQL backend for Academic Consultation Booking System.

## Setup

```bash
npm install

# Configure database
cp .env.example .env
# Update DATABASE_URL in .env

# Run migrations
npm run migrate

# Start development server
npm run dev