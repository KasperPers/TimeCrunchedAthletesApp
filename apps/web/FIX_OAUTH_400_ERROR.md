# Fix OAuth Callback Error (400 Bad Request)

## The Problem

You're seeing this error:
```
[next-auth][error][OAUTH_CALLBACK_ERROR]
expected 200 OK, got: 400 Bad Request
```

This means Strava is rejecting the OAuth callback, usually due to a configuration mismatch.

## Solution: Fix Strava App Settings

### Step 1: Go to Strava API Settings

Visit: **https://www.strava.com/settings/api**

### Step 2: Find Your App

Look for the app with Client ID: **181924**

### Step 3: Verify These Settings EXACTLY

⚠️ **Critical**: The settings must match exactly as shown below:

**Authorization Callback Domain**
```
localhost
```

**Important Notes:**
- ❌ NOT `http://localhost`
- ❌ NOT `localhost:3000`
- ❌ NOT `http://localhost:3000`
- ✅ JUST `localhost` (no protocol, no port)

**Website** (can be anything, but this works):
```
http://localhost:3000
```

### Step 4: Save Changes

Click **"Update"** or **"Save"** at the bottom of the Strava settings page.

### Step 5: Restart Your Dev Server

```bash
# Stop the server (Ctrl+C in Terminal)

# Start it again
npm run dev
```

### Step 6: Test Again

1. Go to http://localhost:3000
2. Click "Connect with Strava"
3. Authorize on Strava
4. You should be redirected to the dashboard ✅

## Alternative: Check Your Client Secret

If the above doesn't work, your Client Secret might have been regenerated.

### Verify Client Secret

1. Go to https://www.strava.com/settings/api
2. Check if your **Client Secret** is still: `eb074055f944bd71fe8f1b156cf78fb8a3808108`
3. If it's different, update your `.env.local`:

```bash
# Edit .env.local
nano .env.local

# Update the STRAVA_CLIENT_SECRET line
# Save with Ctrl+X, then Y, then Enter

# Restart server
npm run dev
```

## Common Mistakes

### ❌ Wrong Callback Domain Examples:
- `http://localhost`
- `localhost:3000`
- `http://localhost:3000`
- `https://localhost`
- `127.0.0.1`

### ✅ Correct Callback Domain:
- `localhost` (exactly this, nothing more)

## Still Not Working?

### Check 1: Verify .env.local is loaded

```bash
# In Terminal, from project folder
cat .env.local
```

Should show:
```
STRAVA_CLIENT_ID="181924"
STRAVA_CLIENT_SECRET="eb074055f944bd71fe8f1b156cf78fb8a3808108"
```

### Check 2: Clear browser cookies

Sometimes cached OAuth data causes issues:
1. Open Chrome/Safari Developer Tools (Cmd+Option+I)
2. Go to Application tab
3. Clear cookies for localhost
4. Try again

### Check 3: Try a different browser

Sometimes browser extensions block OAuth. Try:
- Safari (if you used Chrome)
- Chrome Incognito mode
- Firefox

## What Should Happen (Success Flow)

1. Click "Connect with Strava" → Redirects to Strava
2. Strava shows authorization page → Click "Authorize"
3. Redirects back to http://localhost:3000/dashboard
4. Dashboard shows your name and "Sync Activities" button

## Screenshot of Correct Strava Settings

Your Strava API settings page should look like this:

```
My API Application

Application Name: [Your app name]
Category: Training
Website: http://localhost:3000
Authorization Callback Domain: localhost  ← CRITICAL!

Client ID: 181924
Client Secret: eb074055f944bd71fe8f1b156cf78fb8a3808108
```

---

**Most Common Fix**: Change Authorization Callback Domain to exactly `localhost` (no http://, no port)
