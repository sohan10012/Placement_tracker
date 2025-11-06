# Placement Tracker Backend API

Complete Node.js + Express + TypeScript backend for the Placement Tracker application.

## Features

- 🔐 JWT-based authentication
- 🗄️ PostgreSQL database with connection pooling
- 🛡️ Secure password hashing with bcrypt
- 📊 Complete CRUD operations for all entities
- 🚀 Production-ready for Vercel deployment
- 🔍 Proper error handling and validation
- 📈 Dashboard statistics endpoint

## Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL (Neon.tech)
- **Authentication:** JWT + bcrypt
- **Deployment:** Vercel

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
```bash
cp .env.example .env
```

Edit `.env` with your database credentials and JWT secret.

### 3. Create Database Tables
Run the `schema.sql` file in your PostgreSQL database.

### 4. Run Development Server
```bash
npm run dev
```

Server runs on `http://localhost:3001`

## Project Structure

```
backend/
├── src/
│   ├── controllers/      # Business logic
│   ├── routes/          # API routes
│   ├── middleware/      # Auth middleware
│   ├── db.ts           # Database connection
│   └── index.ts        # Express app
├── schema.sql          # Database schema
├── package.json
├── tsconfig.json
└── vercel.json        # Vercel config
```

## API Documentation

See `DEPLOYMENT_GUIDE.md` for complete API endpoint reference.

## Deployment

See `DEPLOYMENT_GUIDE.md` for step-by-step deployment instructions for:
- Neon.tech database setup
- Local development
- Vercel deployment
- Frontend integration

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server

## License

MIT
