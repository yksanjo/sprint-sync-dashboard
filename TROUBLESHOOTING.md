# 🔧 Troubleshooting Guide

## "Cannot GET" Error

### Issue: App not responding when visiting URL

**Fix 1: Check server is listening on 0.0.0.0**

The server must listen on `0.0.0.0` (all interfaces), not `localhost`:

```typescript
app.listen(PORT, '0.0.0.0', () => {
  // ✅ Correct - listens on all interfaces
});
```

**Fix 2: Check Railway logs**

1. Go to Railway → Deployments → View Logs
2. Look for:
   - `🚀 Server running on port XXXX`
   - Any error messages
   - Database connection status

**Fix 3: Check PORT environment variable**

Railway sets `PORT` automatically. Make sure your code uses it:

```typescript
const PORT = process.env.PORT || 3000;
```

## Database Connection Issues

### Issue: Prisma errors on startup

**Check 1: DATABASE_URL is set**

1. Go to Railway → Variables
2. Verify `DATABASE_URL` exists
3. It should look like: `postgresql://user:pass@host:port/db`

**Check 2: Run migrations**

In Railway shell or locally:

```bash
npx prisma migrate deploy
```

**Check 3: Database service is running**

1. Go to Railway → Services
2. Verify PostgreSQL service is running
3. Check it's connected to your app service

## App Crashes on Startup

### Check Railway Deploy Logs

1. Go to Railway → Deployments
2. Click on latest deployment
3. Click "View Logs" or "Deploy Logs"
4. Look for:
   - Error messages
   - Stack traces
   - Missing environment variables

### Common Issues

**Missing DATABASE_URL:**
```
Error: Can't reach database server
```
→ Set `DATABASE_URL` in Railway Variables

**Missing JWT_SECRET:**
```
Error: JWT_SECRET is required
```
→ Set `JWT_SECRET` in Railway Variables (generate a random string)

**Prisma Client not generated:**
```
Error: Cannot find module '@prisma/client'
```
→ Check build logs - `npx prisma generate` should run during build

**Port already in use:**
```
Error: EADDRINUSE
```
→ Railway handles this automatically, but check if multiple services are running

## Web UI Not Loading

### Issue: Static files not served

**Check 1: Web dist exists**

In Railway logs, look for:
```
Web path: /app/dist/server/../web/dist
```

If it says "Web UI not built yet", the build didn't complete.

**Check 2: Build completed**

1. Go to Railway → Deployments
2. Check build logs
3. Should see: `✓ built in XXXms` at the end

**Check 3: File paths**

The server looks for files at:
```
dist/server/../web/dist
```

Make sure the build creates files there.

## Health Check Endpoint

Test if the server is running:

```bash
curl https://your-app.up.railway.app/api/health
```

Should return:
```json
{"status":"ok","timestamp":"2024-..."}
```

## Quick Debug Checklist

- [ ] Server logs show "Server running on port XXXX"
- [ ] Server logs show "Database connected successfully"
- [ ] `/api/health` returns 200 OK
- [ ] `DATABASE_URL` is set in Railway Variables
- [ ] `JWT_SECRET` is set in Railway Variables
- [ ] Build logs show "✓ built" for web UI
- [ ] No errors in deploy logs
- [ ] Service shows as "Active" in Railway

## Get Help

If still having issues:

1. **Share Railway logs:**
   - Deploy logs (build)
   - Runtime logs (deploy)

2. **Check these:**
   - Environment variables
   - Database connection
   - Build completion

3. **Test locally:**
   ```bash
   npm run build
   npm start
   ```
   Visit: http://localhost:3000



