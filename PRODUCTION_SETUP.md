# Production Setup Guide for Ubuntu

## Files Changed for Production

### 1. Frontend API Configuration (`src/services/api.js`)
- ✅ Updated to use environment variable `VITE_API_BASE_URL`
- Falls back to `/api` for development (uses Vite proxy)
- In production, set `VITE_API_BASE_URL=http://ticket.dialdesk.in:8030`

### 2. Vite Configuration (`vite.config.js`)
- ✅ Updated proxy to use environment variable
- Works for both development and production builds

## Production Deployment Steps

### ⚠️ IMPORTANT: Fix for "HTML instead of JSON" Error

If you're getting HTML responses instead of JSON from the API, it means the frontend is not connecting to the backend correctly.

### Option 1: Direct API URL (Recommended - Already Configured)

The code now **automatically uses the full backend URL in production**. You just need to rebuild:

1. **Rebuild the frontend:**
```bash
npm run build
```

2. **The built files will be in `dist/` directory**

**Note:** The code will automatically use `http://ticket.dialdesk.in:8030` in production mode. No `.env.production` file needed unless you want to override it.

### Option 2: Using Environment Variable (Optional)

If you want to explicitly set the API URL:

1. **Create `.env.production` file in the root directory:**
```bash
# .env.production
VITE_API_BASE_URL=http://ticket.dialdesk.in:8030
```

2. **Build the frontend:**
```bash
npm run build
```

3. **The built files will be in `dist/` directory**

4. **Serve the frontend with Nginx:**
```nginx
server {
    listen 80;
    server_name ticket.dialdesk.in;

    # Serve frontend static files
    root /path/to/your/project/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend
    location /api {
        proxy_pass http://localhost:8030;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Option 2: Using Nginx Proxy (Alternative)

If you want to keep using `/api` in production:

1. **Keep `.env.production` empty or don't create it:**
```bash
# .env.production (empty or don't create)
# VITE_API_BASE_URL=
```

2. **Build the frontend:**
```bash
npm run build
```

3. **Configure Nginx to proxy `/api` to backend:**
```nginx
server {
    listen 80;
    server_name ticket.dialdesk.in;

    root /path/to/your/project/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend
    location /api {
        rewrite ^/api/(.*) /$1 break;
        proxy_pass http://localhost:8030;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Quick Setup Commands for Ubuntu

```bash
# 1. Create production environment file
echo "VITE_API_BASE_URL=http://ticket.dialdesk.in:8030" > .env.production

# 2. Install dependencies (if not already done)
npm install

# 3. Build frontend for production
npm run build

# 4. The built files are now in the 'dist' directory
# Copy these to your web server directory
```

## Backend Setup on Ubuntu

1. **Make sure backend is running on port 8030:**
```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8030
```

2. **Or use a process manager like PM2 or systemd:**
```bash
# Using PM2
pm2 start "uvicorn main:app --host 0.0.0.0 --port 8030" --name itsupport-backend

# Or create a systemd service
```

## Important Notes

1. **CORS Configuration**: The backend CORS is already configured to allow `http://ticket.dialdesk.in:8030` and `http://ticket.dialdesk.in`

2. **Environment Variables**: 
   - Development: Uses Vite proxy (no `.env` needed)
   - Production: Create `.env.production` with `VITE_API_BASE_URL`

3. **Build Process**: 
   - `npm run build` creates optimized production build in `dist/` folder
   - Environment variables are embedded at build time

4. **After Building**: 
   - Restart your web server (Nginx/Apache)
   - Make sure backend is running on port 8030
   - Check firewall allows port 8030

## Testing Production Build

```bash
# Build for production
npm run build

# Preview the production build locally
npm run preview
```

## Troubleshooting

1. **Frontend not connecting to backend:**
   - Check `.env.production` has correct `VITE_API_BASE_URL`
   - Rebuild after changing environment variables: `npm run build`
   - Check browser console for API errors
   - Verify backend is accessible at the URL

2. **CORS errors:**
   - Verify backend CORS includes your frontend domain
   - Check `backend/main.py` CORS configuration

3. **404 errors on page refresh:**
   - Make sure Nginx has `try_files $uri $uri/ /index.html;` in location block

