# 🚀 Deployment Guide

Complete guide to hosting your portfolio system using GitHub as the source of truth.

---

## 📁 Repository Setup

### What to commit
```
portfolio/
├── backend/
│   ├── server.js
│   ├── db.js
│   ├── package.json
│   ├── middleware/
│   └── routes/
├── frontend-public/
│   ├── index.html
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── frontend-admin/
│   ├── index.html
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── .env.example
├── .gitignore
└── DEPLOYMENT.md
```

### `.gitignore` (already included)
```
node_modules/
.env
*.db
dist/
.DS_Store
```

### Initialize & push
```bash
git init
git add .
git commit -m "Initial portfolio system"
git remote add origin https://github.com/YOUR_USERNAME/portfolio.git
git push -u origin main
```

---

## 🔐 Environment Variables

### `.env` structure (backend)
```env
ADMIN_PASSWORD=your-secure-password
JWT_SECRET=a-long-random-string-here
PORT=3000
# Optional — set in production only:
PUBLIC_URL=https://your-portfolio.vercel.app
ADMIN_URL=https://your-admin.vercel.app
```

> Generate a secure JWT secret: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

---

## ⚙️ Backend Deployment (Railway or Render)

### Option A: Railway (recommended)

1. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub Repo**
2. Select your repository
3. Set **Root Directory** to `backend`
4. Railway auto-detects Node.js. Build/start commands:
   - **Build**: `npm install`
   - **Start**: `npm start`
5. Go to **Variables** tab → add:
   - `ADMIN_PASSWORD` = your password
   - `JWT_SECRET` = your secret
   - `PORT` = `3000` (or Railway assigns one)
   - `PUBLIC_URL` = your public frontend URL (after deploying it)
   - `ADMIN_URL` = your admin frontend URL
6. Deploy → note your backend URL (e.g., `https://portfolio-backend-xxx.up.railway.app`)

### Option B: Render

1. [render.com](https://render.com) → **New Web Service** → connect GitHub repo
2. **Root Directory**: `backend`
3. **Build Command**: `npm install`
4. **Start Command**: `npm start`
5. Add environment variables in the **Environment** section
6. Deploy → note your service URL

---

## 🌐 Public Frontend Deployment (Vercel)

1. Go to [vercel.com](https://vercel.com) → **New Project** → import your GitHub repo
2. Set **Root Directory** to `frontend-public`
3. **Framework Preset**: Vite
4. **Build Command**: `npm run build`
5. **Output Directory**: `dist`
6. Add environment variable:
   - `VITE_API_URL` = your backend URL (e.g., `https://portfolio-backend-xxx.up.railway.app`)
7. Deploy

### Netlify alternative
1. [netlify.com](https://netlify.com) → **Add new site** → import from Git
2. **Base directory**: `frontend-public`
3. **Build command**: `npm run build`
4. **Publish directory**: `frontend-public/dist`
5. Add env var `VITE_API_URL` in Site settings → Environment

---

## 🔒 Admin Frontend Deployment

Same process as public frontend, but with:

- **Root Directory**: `frontend-admin`
- **Same `VITE_API_URL`** environment variable pointing to your backend
- Deploy as a separate Vercel/Netlify site

> **Tip**: Use a less obvious subdomain for the admin, e.g., `portfolio-manage.vercel.app`

---

## 🌍 Custom Domain (Optional)

### Vercel
1. Go to your project → **Settings** → **Domains**
2. Add your domain (e.g., `yourname.com`)
3. Update DNS records as instructed (typically an A record or CNAME)

### Railway
1. Go to your service → **Settings** → **Networking** → **Custom Domain**
2. Add domain and configure DNS

---

## 🔄 How to Update Your Portfolio

The workflow is simple — **no redeployment needed for content changes**:

1. Go to your admin panel URL
2. Log in with your admin password
3. Edit your profile, add skills, create categories, add items
4. Changes save instantly to the backend database
5. Refresh the public portfolio — updates are live immediately

> Content is stored in the backend's SQLite database, not in the code. You only need to redeploy if you change the code itself.

---

## 💾 Backup Strategy

### Manual backup
```bash
# SSH/download portfolio.db from your hosting provider
# Railway: use railway CLI
railway link
railway run cat portfolio.db > backup-$(date +%Y%m%d).db

# Render: use the shell tab in your service dashboard
```

### Automated backup (optional)
Set up a cron job or GitHub Action that periodically:
1. Hits `GET /api/profile`, `GET /api/skills`, `GET /api/socials`, `GET /api/categories`
2. Saves JSON responses to a backup file in your repo or cloud storage

### Restore from backup
Simply replace `portfolio.db` on your server with the backup file and restart.

---

## 🧪 Local Development

```bash
# Terminal 1: Backend
cd backend
cp ../.env.example .env  # then edit with your values
npm install
npm run dev              # http://localhost:3000

# Terminal 2: Public frontend
cd frontend-public
npm install
npm run dev              # http://localhost:5173

# Terminal 3: Admin frontend
cd frontend-admin
npm install
npm run dev              # http://localhost:5174
```

Both frontends proxy `/api` requests to `localhost:3000` in dev mode.
