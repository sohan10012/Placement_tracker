# Placement Tracker Backend - Deployment Guide

## Complete Backend Setup & Deployment

This guide will walk you through setting up a PostgreSQL database on Neon.tech and deploying your backend to Vercel.

---

## Part 1: Database Setup on Neon.tech

### Step 1: Create a Neon Account & Database

1. Go to [Neon.tech](https://neon.tech)
2. Sign up for a free account (no credit card required)
3. Click **"Create a new project"**
4. Choose a project name (e.g., `placement-tracker`)
5. Select a region close to your users
6. Click **"Create Project"**

### Step 2: Get Your Database Connection String

1. After project creation, you'll see your connection details
2. Copy the **Connection String** that looks like:
   ```
   postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
   ```
3. Save this for later

### Step 3: Initialize the Database Schema

You have two options:

#### Option A: Using Neon's SQL Editor (Recommended)
1. In your Neon dashboard, click on **"SQL Editor"**
2. Open the `schema.sql` file from your backend folder
3. Copy the entire content
4. Paste it into the SQL Editor
5. Click **"Run"**

#### Option B: Using psql (Command Line)
```bash
cd backend
psql "YOUR_DATABASE_URL" -f schema.sql
```

---

## Part 2: Local Development Setup

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

### Step 2: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your actual values:
   ```env
   DATABASE_URL=postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
   PORT=3001
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NODE_ENV=development
   ```

   **Important:** Generate a strong JWT_SECRET:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

### Step 3: Run Locally

```bash
npm run dev
```

Your backend should now be running at `http://localhost:3001`

### Step 4: Test the API

```bash
# Health check
curl http://localhost:3001/health

# Should return: {"status":"healthy","database":"connected"}
```

---

## Part 3: Deploy to Vercel

### Step 1: Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### Step 2: Deploy Using Vercel Dashboard

1. Go to [Vercel](https://vercel.com)
2. Sign in with GitHub/GitLab/Bitbucket
3. Click **"Add New Project"**
4. Import your repository
5. Set the **Root Directory** to `backend`
6. Click **"Environment Variables"**
7. Add these variables:
   - `DATABASE_URL`: Your Neon connection string
   - `JWT_SECRET`: Your JWT secret key
   - `NODE_ENV`: `production`

8. Click **"Deploy"**

### Step 3: Deploy Using Vercel CLI

```bash
cd backend
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? placement-tracker-backend
# - Directory? ./
# - Override settings? No

# Set environment variables
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add NODE_ENV

# Deploy to production
vercel --prod
```

### Step 4: Note Your Backend URL

After deployment, Vercel will give you a URL like:
```
https://placement-tracker-backend.vercel.app
```

Save this URL for frontend configuration.

---

## Part 4: Connect Frontend to Backend

### Update Frontend Configuration

1. Create `.env` in your frontend root:
   ```env
   VITE_API_URL=https://your-backend-url.vercel.app
   ```

2. Update the frontend to use this backend URL instead of Supabase

3. Modify `src/lib/supabase.ts` to use your custom backend API

---

## Part 5: API Endpoints Reference

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Login
- `GET /api/auth/session` - Get current session

### Students
- `GET /api/students` - Get all students
- `POST /api/students` - Create student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Companies
- `GET /api/companies` - Get all companies
- `POST /api/companies` - Create company
- `PUT /api/companies/:id` - Update company
- `DELETE /api/companies/:id` - Delete company

### Placements
- `GET /api/placements` - Get all placements
- `POST /api/placements` - Create placement
- `PUT /api/placements/:id` - Update placement
- `DELETE /api/placements/:id` - Delete placement

### Interviews
- `GET /api/interviews` - Get all interviews
- `POST /api/interviews` - Create interview
- `PUT /api/interviews/:id` - Update interview
- `DELETE /api/interviews/:id` - Delete interview
- `GET /api/interviews/:interviewId/students` - Get students for interview
- `POST /api/interviews/students` - Add student to interview
- `DELETE /api/interviews/students/:id` - Remove student from interview

### Statistics
- `GET /api/stats` - Get dashboard statistics

---

## Part 6: Troubleshooting

### Database Connection Issues

If you get connection errors:

1. Check your DATABASE_URL is correct
2. Ensure SSL is enabled in connection string: `?sslmode=require`
3. Verify Neon project is not suspended (free tier auto-suspends after inactivity)
4. Check firewall/network settings

### Vercel Deployment Issues

1. **Build fails:** Check Node.js version in `package.json`:
   ```json
   "engines": {
     "node": ">=18.0.0"
   }
   ```

2. **Runtime errors:** Check Vercel logs:
   ```bash
   vercel logs
   ```

3. **Environment variables not working:**
   - Redeploy after adding env variables
   - Check variable names match exactly

### CORS Issues

If frontend can't connect to backend:

1. Verify CORS is enabled in `src/index.ts`
2. Add your frontend domain to CORS whitelist if needed:
   ```typescript
   app.use(cors({
     origin: ['http://localhost:5173', 'https://your-frontend.vercel.app']
   }));
   ```

---

## Part 7: Production Best Practices

### Security
- ✅ Use strong JWT secrets (32+ characters)
- ✅ Enable SSL for database connections
- ✅ Don't commit `.env` files to git
- ✅ Use environment variables for all secrets
- ✅ Implement rate limiting for auth endpoints

### Performance
- ✅ Database connection pooling is enabled
- ✅ Add indexes to frequently queried columns
- ✅ Monitor Neon database usage
- ✅ Consider upgrading Neon plan for production

### Monitoring
- Check Vercel Analytics for API performance
- Monitor Neon dashboard for database metrics
- Set up error tracking (Sentry, etc.)

---

## Part 8: Free Tier Limits

### Neon.tech Free Tier
- 3 GB storage
- 1 project
- Auto-suspend after 5 minutes inactivity
- 100 hours compute time per month

### Vercel Free Tier
- 100 GB bandwidth per month
- 100 serverless function invocations per day
- Unlimited projects

---

## Support

If you encounter issues:
1. Check the logs: `vercel logs` or Vercel dashboard
2. Verify database connection in Neon dashboard
3. Test API endpoints using Postman or curl
4. Check this guide for common solutions

---

## Summary Checklist

- [ ] Created Neon account and database
- [ ] Copied database connection string
- [ ] Ran schema.sql to create tables
- [ ] Created .env file with all variables
- [ ] Tested locally with `npm run dev`
- [ ] Deployed to Vercel
- [ ] Added environment variables in Vercel
- [ ] Noted backend URL
- [ ] Updated frontend to use new backend
- [ ] Tested all API endpoints

Your backend is now production-ready! 🚀
