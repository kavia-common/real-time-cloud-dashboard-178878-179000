# Authentication and Routing Fix - Troubleshooting Guide

## Issues Identified and Fixed

### Issue 1: Network Error on Login - API Path Mismatch
**Root Cause**: The frontend `.env` file had `REACT_APP_API_BASE_URL=http://localhost:4000/api`, but the backend routes are mounted directly on the root path (e.g., `/auth/login`, `/users`, `/metrics`), NOT under `/api`.

**Symptom**: When attempting to login, the frontend was making requests to:
- `http://localhost:4000/api/auth/login` (404 Not Found)

But the backend expects:
- `http://localhost:4000/auth/login` (200 OK)

**Fix Applied**: Updated `cloud_dashboard_frontend/.env`:
```
# BEFORE (incorrect):
REACT_APP_API_BASE_URL=http://localhost:4000/api

# AFTER (correct):
REACT_APP_API_BASE_URL=http://localhost:4000
```

### Issue 2: Admin Credentials Mismatch
**Root Cause**: Frontend `.env` documented the password as `admin`, but the backend uses `ChangeMe123!` as defined in `cloud_dashboard_backend/.env`.

**Fix Applied**: Updated documentation in `cloud_dashboard_frontend/.env`:
```
REACT_APP_DEFAULT_ADMIN_PASSWORD=ChangeMe123!
```

**Correct Admin Credentials**:
- Email: `admin@example.com`
- Password: `ChangeMe123!`

## Backend Route Structure

The backend (`cloud_dashboard_backend/src/server.js`) mounts routes as follows:

```javascript
app.use('/auth', authRoutes);      // /auth/login, /auth/register, /auth/me
app.use('/users', usersRoutes);    // /users, /users/:id
app.use('/metrics', metricsRoutes); // /metrics/stats, /metrics/activity
```

**NO `/api` prefix is used on the backend.**

## Verification Steps

### 1. Verify Backend is Running
```bash
cd cloud_dashboard_backend
curl http://localhost:4000/health
# Expected: {"status":"ok","time":"..."}
```

### 2. Test Login Endpoint Directly
```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"ChangeMe123!"}'
# Expected: {"token":"...","user":{...}}
```

### 3. Restart Frontend (REQUIRED)
**IMPORTANT**: React environment variables are compiled at build time. You MUST restart the frontend development server after changing `.env`:

```bash
cd cloud_dashboard_frontend
# Stop the current process (Ctrl+C if running in terminal)
# Then restart:
npm start
```

### 4. Test Login in Browser
1. Navigate to `http://localhost:3000/login`
2. Enter credentials:
   - Email: `admin@example.com`
   - Password: `ChangeMe123!`
3. Click "Sign in"
4. Should redirect to dashboard at `http://localhost:3000/`

### 5. Verify Protected Routes Work
After successful login, test these routes:
- `/` - Dashboard (should show metrics)
- `/users` - User management (admin only)
- `/activity` - Activity feed
- `/settings` - Settings page
- `/profile` - User profile

### 6. Verify 404 Handling
Test unknown routes:
- Navigate to `http://localhost:3000/nonexistent-page`
- Should display "404 - Not Found" page with "Go Home" button
- Known routes should NOT trigger 404

## Environment Configuration Summary

### Frontend (.env)
```env
REACT_APP_API_BASE_URL=http://localhost:4000
REACT_APP_SOCKET_URL=http://localhost:4000
REACT_APP_SOCKET_PATH=/socket.io
```

### Backend (.env)
```env
PORT=4000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
CORS_ORIGIN=http://localhost:3000
SOCKET_PATH=/socket.io
DEFAULT_ADMIN_EMAIL=admin@example.com
DEFAULT_ADMIN_PASSWORD=ChangeMe123!
```

## Common Issues

### Issue: Still Getting 404 on Login
**Solution**: 
1. Verify frontend `.env` has `REACT_APP_API_BASE_URL=http://localhost:4000` (no `/api`)
2. Restart frontend: Stop and run `npm start` again
3. Clear browser cache and localStorage
4. Check browser console for actual URL being called

### Issue: CORS Error
**Solution**: 
1. Verify backend `CORS_ORIGIN=http://localhost:3000`
2. Restart backend after changing CORS_ORIGIN
3. Ensure frontend is running on port 3000

### Issue: Invalid Credentials
**Solution**: 
1. Use password: `ChangeMe123!` (not `admin`)
2. Verify backend logs show admin user was created on startup
3. Check MongoDB connection is working

### Issue: Socket.IO Not Connecting
**Solution**: 
1. Verify both frontend and backend use same `SOCKET_PATH=/socket.io`
2. Check browser console for socket connection errors
3. Verify backend is running and accessible

## Next Steps After Fix

1. **Restart Frontend**: Stop the current dev server and run `npm start`
2. **Test Login**: Try logging in with `admin@example.com` / `ChangeMe123!`
3. **Verify Dashboard**: Check that metrics load and live updates work
4. **Test All Routes**: Navigate through all pages to ensure no 404s
5. **Update Documentation**: If needed, update user-facing docs with correct credentials

## Production Considerations

Before deploying to production:
1. Change `DEFAULT_ADMIN_PASSWORD` to a strong, unique password
2. Update `JWT_SECRET` to a cryptographically secure random string
3. Set `CORS_ORIGIN` to your production frontend URL
4. Use HTTPS for both frontend and backend URLs
5. Set appropriate rate limits and security headers
6. Enable MongoDB authentication and use connection string with credentials
7. Store secrets in secure environment variable management (not in `.env` files)
