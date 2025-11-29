# Deployment Guide - University Verification System

## Quick Start Checklist

- [ ] Database migration applied
- [ ] Edge function deployed
- [ ] Environment variables configured
- [ ] Types generated
- [ ] Frontend builds successfully
- [ ] All routes accessible

---

## Step 1: Apply Database Migration

### Local Development
```bash
cd /Users/kharuhangrai/hackathon/verifai

# Push migration to database
supabase migration up

# Or if using Supabase CLI:
supabase db push
```

### Verify Migration
```bash
# Check if universities table exists
supabase db query "SELECT * FROM universities LIMIT 1;"

# You should see an empty result (no error means success)
```

---

## Step 2: Deploy Edge Function

### Option A: Using Supabase CLI
```bash
# From project root
supabase functions deploy register-university
```

### Option B: Via Supabase Dashboard
1. Go to your Supabase Project
2. Navigate to `Functions` → `register-university`
3. Check if function appears
4. If not, deploy via CLI

### Verify Deployment
```bash
# Test function (replace PROJECT_ID and ANON_KEY)
curl -X POST https://PROJECT_ID.supabase.co/functions/v1/register-university \
  -H "Authorization: Bearer ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "legalName": "Test University",
    "type": "STATE",
    "state": "Maharashtra",
    "websiteDomain": "test.edu.in",
    "registrarOfficialEmail": "registrar@test.edu.in",
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f42bE"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "University registered successfully",
  "data": { ... }
}
```

---

## Step 3: Environment Variables

### Create `.env.local` (if not exists)
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

### Get Values from Supabase Dashboard
1. Go to Settings → API
2. Copy `Project URL` → `VITE_SUPABASE_URL`
3. Copy `anon public` key → `VITE_SUPABASE_PUBLISHABLE_KEY`

### Verify Configuration
```bash
# Check env vars are loaded
grep VITE_SUPABASE .env.local
```

---

## Step 4: Update Supabase Types

### Generate Fresh Types
```bash
# If using Supabase CLI v1.25+
supabase gen types typescript --local > src/integrations/supabase/types.ts
```

### Or manually
The types file has been updated at: `src/integrations/supabase/types.ts`

---

## Step 5: Build & Test Locally

### Start Dev Server
```bash
npm run dev
```

### Test Registration Flow
1. Open browser: `http://localhost:8080`
2. Click "Register University" in navbar
3. Fill form with test data:
   ```
   Legal Name: Test University
   Type: STATE
   State: Maharashtra
   Website Domain: test.edu.in
   Email: registrar@test.edu.in
   Wallet: 0x742d35Cc6634C0532925a3b844Bc9e7595f42bE
   ```
4. Submit and verify:
   - Should see success page
   - Check browser console for errors

### Test Admin Dashboard
1. Go to `/admin` → Universities tab
2. Should see the registered university
3. Try clicking "Approve" or "Details"

---

## Step 6: Production Build

### Build for Production
```bash
npm run build
```

### Test Build Locally
```bash
npm run preview
```

### Check Build Output
```bash
# Should see dist/ folder with optimized files
ls -la dist/
```

---

## Deployment Options

### Option A: Vercel (Recommended for This Stack)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts and select your Supabase project
```

### Option B: Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build and deploy
netlify deploy --prod --dir=dist
```

### Option C: Docker
```bash
# Build image
docker build -t verifai-university .

# Run
docker run -p 8080:8080 verifai-university
```

### Option D: Traditional Server
```bash
# Build
npm run build

# Deploy dist/ folder to server
# Point web server (nginx/apache) to dist/ folder
```

---

## Post-Deployment Verification

### 1. Check Routes
- [ ] `/university/register` accessible
- [ ] `/university/success` accessible
- [ ] `/admin` shows universities tab
- [ ] Navbar has "Register University" link

### 2. Test Database Connection
```bash
# Via Supabase CLI or dashboard, run:
SELECT COUNT(*) as total FROM universities;
```

### 3. Test Registration
```bash
# Fill form and submit on production
# Check if data appears in Supabase dashboard
# Tables → universities → should show new record
```

### 4. Test Admin Functions
```bash
# Log in to /admin
# Click on a university
# Try approve/reject
# Verify status changes in database
```

### 5. Monitor Errors
```bash
# Check Supabase Edge Function logs
# Check browser console in deployed site
# Check application error logs
```

---

## Troubleshooting Deployment

### Issue: "Universities table not found"
**Solution:**
```bash
# Ensure migration ran
supabase migration up

# Verify table exists
supabase db query "SELECT * FROM information_schema.tables WHERE table_name='universities';"
```

### Issue: "Edge function returns 403"
**Solution:**
```bash
# Check RLS policies are allowing inserts
# In Supabase dashboard:
# - Go to Authentication → Policies
# - Universities table should have insert policy enabled
# - May need to set up authentication
```

### Issue: "Wallet validation always fails"
**Solution:**
- Verify wallet is exactly 42 characters (0x + 40 hex)
- Check wallet format: `0x[A-Fa-f0-9]{40}`

### Issue: "Form shows no error but won't submit"
**Solution:**
```bash
# Check browser console for JavaScript errors
# Open DevTools → Console tab
# Look for validation errors
# Check network tab to see if POST request sent
```

### Issue: "Admin dashboard shows no universities"
**Solution:**
1. Verify migration applied: `supabase migration up`
2. Refresh page (Ctrl+R)
3. Check browser console for errors
4. Verify RLS policies (should allow SELECT for public)

---

## Performance Optimization

### Database
```sql
-- Already indexed by migration, but verify:
SELECT * FROM pg_indexes WHERE tablename = 'universities';

-- Should show indexes on:
-- - verification_status
-- - website_domain  
-- - registrar_official_email
```

### Frontend
```bash
# Analyze bundle size
npm run build
# Check size of dist/

# Should be < 500KB for this component
```

### Caching
```typescript
// Optional: Add React Query caching
// Already implemented in admin dashboard
// Universities auto-refresh every fetch
```

---

## Rollback Plan

### If Issues After Deployment

1. **Revert Database Changes**
   ```bash
   supabase migration down
   ```

2. **Revert Function**
   ```bash
   # Delete function from dashboard, or:
   supabase functions delete register-university
   ```

3. **Revert Code**
   ```bash
   git revert <commit-hash>
   git push
   ```

4. **Redeploy Previous Version**
   ```bash
   npm run build
   npm run deploy
   ```

---

## Monitoring & Maintenance

### Weekly Checks
- [ ] Check for registration errors in Supabase logs
- [ ] Verify admin dashboard loads without errors
- [ ] Test approval/rejection flow
- [ ] Check for database growth

### Monthly Tasks
- [ ] Review pending universities
- [ ] Archive old rejected registrations
- [ ] Update documentation
- [ ] Test backup restoration

---

## Security Checklist

- [ ] Edge function has CORS configured
- [ ] RLS policies restrict access appropriately
- [ ] Email validation working correctly
- [ ] Wallet validation prevents invalid addresses
- [ ] Duplicate prevention active
- [ ] No sensitive data in logs
- [ ] Rate limiting considered for production
- [ ] Environment variables not committed to git

---

## Support & Debugging

### Get Logs
```bash
# Edge function logs
supabase functions logs register-university --limit 50

# Database logs (if enabled)
supabase db logs
```

### Test Edge Function Directly
```bash
# Use Supabase dashboard Function Editor
# Or use curl:
curl -X POST https://your-project.supabase.co/functions/v1/register-university \
  -H "Authorization: Bearer your-anon-key" \
  -H "Content-Type: application/json" \
  -d '{...}'
```

### Check Database State
```bash
# Connect via psql or Supabase SQL editor
SELECT * FROM universities WHERE verification_status = 'PENDING';
```

---

## Performance Metrics (After Deployment)

Expected metrics:
- Form load time: < 1s
- Form submission time: < 2s
- Admin dashboard load: < 2s
- University list display: < 1s

---

## Final Checklist

- [x] Code is clean and typed
- [x] Tests pass (if applicable)
- [x] Documentation complete
- [x] Migration created
- [x] Function ready to deploy
- [x] Types updated
- [x] Routes configured
- [x] Error handling in place
- [x] UI responsive
- [x] Security measures taken

**Status: READY FOR PRODUCTION DEPLOYMENT** ✅

---

## Questions?

Refer to:
1. `IMPLEMENTATION_SUMMARY.md` - What was built
2. `UNIVERSITY_REGISTRATION.md` - How it works
3. Inline code comments
4. Supabase documentation: https://supabase.com/docs

---

**Created:** November 29, 2025  
**Last Updated:** November 29, 2025
