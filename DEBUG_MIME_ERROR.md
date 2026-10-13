# 🔧 Debug MIME Type Error (Comprehensive Guide)

## 🚨 Error Message

```
Failed to load module script: Expected a JavaScript-or-Wasm module script 
but the server responded with a MIME type of "text/html".
```

---

## 🔍 What This Means

Browser tries to load:
```
GET /assets/js/index-abc123.js
```

Server returns:
```html
<!DOCTYPE html>
<html>404 Not Found</html>  <!-- ❌ HTML instead of JS! -->
```

Browser expects: `application/javascript`  
Server returns: `text/html` (404 error page)

---

## ✅ QUICK FIX (Try These First)

### **Fix 1: Hard Refresh (90% Success Rate)**

**Chrome:**
```
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)
```

**Or:**
1. F12 (Open DevTools)
2. Right-click refresh button (⟳)
3. Choose "Empty Cache and Hard Reload"

---

### **Fix 2: Clear Browser Cache**

```
1. Ctrl + Shift + Delete
2. Time range: "All time"
3. Check: ✅ Cached images and files
4. Click "Clear data"
5. Close browser completely
6. Open browser again
7. Access site
```

---

### **Fix 3: Incognito Mode (Test)**

```
Ctrl + Shift + N (Chrome)
```

Access your site in incognito. If it works → Cache problem!

---

### **Fix 4: Clear Service Worker**

```
1. F12 (DevTools)
2. Tab: Application
3. Left sidebar: Service Workers
4. Click: Unregister (if any)
5. Left sidebar: Storage
6. Click: Clear site data
7. Refresh page
```

---

## 🔍 DEEP DEBUGGING

### **Step 1: Check Network Tab**

```
1. F12 → Network tab
2. Filter: JS
3. Reload page
4. Find the failing JS file (red color)
5. Click on it
6. Tab: Response
```

**What to look for:**

**If Response shows HTML (404 page):**
```html
<!DOCTYPE html>
<html>Not Found</html>
```
→ File doesn't exist on server!

**If Response shows JS:**
```javascript
import React from 'react';
```
→ MIME type config issue!

---

### **Step 2: Verify Build Files Exist**

#### **On Server:**

```bash
# Enter container
sudo docker exec -it frontend-kwhmeter sh

# Check build folder
ls -la build/

# Expected output:
# index.html
# manifest.json
# assets/

# Check JS files
ls -la build/assets/js/

# Expected output:
# vendor-react-[hash].js
# vendor-coreui-[hash].js
# index-[hash].js
# etc.

# Exit container
exit
```

**If folder empty or missing:**
```bash
# Rebuild
sudo docker compose down
sudo docker compose build --no-cache
sudo docker compose up -d
```

---

### **Step 3: Check index.html**

```bash
# View index.html
sudo docker exec -it frontend-kwhmeter cat build/index.html | grep "script"

# Should show:
# <script type="module" crossorigin src="./assets/js/index-abc123.js"></script>
```

**Note the hash:** `index-abc123.js`

**Then check if file exists:**
```bash
sudo docker exec -it frontend-kwhmeter ls build/assets/js/ | grep index

# Should show the SAME hash:
# index-abc123.js
```

**If hash DIFFERENT:**
→ HTML cached but JS files regenerated!
→ Clear browser cache!

---

### **Step 4: Test Direct File Access**

In browser, try access JS file directly:
```
http://your-server:3000/assets/js/index-[hash].js
```

**Expected:** Download JS file or see JS code  
**If 404:** File doesn't exist → rebuild issue  
**If HTML:** Routing issue → serve config problem

---

## 🛠️ SERVER-SIDE FIXES

### **Fix 1: Rebuild Container (Clean)**

```bash
# Complete clean rebuild
sudo docker compose down
sudo docker system prune -f
sudo docker compose build --no-cache
sudo docker compose up -d

# Check logs
sudo docker compose logs -f frontend-kwhmeter

# Should see:
# ✓ built in 15s
# INFO  Accepting connections at http://localhost:3000
```

---

### **Fix 2: Verify Serve Command**

```bash
# Check running command
sudo docker exec -it frontend-kwhmeter ps aux | grep serve

# Should show:
# serve -s build -l 3000 --no-clipboard
```

**If different or not running:**
```bash
# Restart container
sudo docker compose restart frontend-kwhmeter
```

---

### **Fix 3: Manual Test Inside Container**

```bash
# Enter container
sudo docker exec -it frontend-kwhmeter sh

# Try serve manually
serve -s build -l 3001 &

# Test
curl http://localhost:3001

# Should return HTML (not error)

# Kill serve
killall serve

# Exit
exit
```

---

## 🔧 VITE CONFIG FIXES

### **Fix: Add Public Base URL**

If deploying to subdirectory or specific URL:

```javascript
// vite.config.mjs
export default defineConfig(() => {
  return {
    base: process.env.NODE_ENV === 'production' ? './' : '/',
    // ... rest of config
  }
})
```

---

### **Fix: Ensure Correct Asset Paths**

```javascript
build: {
  rollupOptions: {
    output: {
      assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      chunkFileNames: 'assets/js/[name]-[hash].js',
      entryFileNames: 'assets/js/[name]-[hash].js',
    },
  },
}
```

This ensures all assets go to correct folders.

---

## 📊 DEBUGGING CHECKLIST

Run through this checklist:

### **Browser Side:**
- [ ] Hard refresh (Ctrl + Shift + R)
- [ ] Clear browser cache
- [ ] Disable browser extensions
- [ ] Try incognito mode
- [ ] Try different browser
- [ ] Clear service workers

### **Server Side:**
- [ ] Container is running (`docker ps`)
- [ ] Build folder exists in container
- [ ] JS files exist with correct hashes
- [ ] index.html references correct files
- [ ] Serve command is running
- [ ] Port is accessible

### **Build Side:**
- [ ] `npm run build` succeeds locally
- [ ] build/ folder contains files
- [ ] Docker build succeeds
- [ ] No error in build logs

---

## 🎯 MOST COMMON CAUSES & FIXES

### **Cause 1: Browser Cache (80% of cases)**
**Fix:** Hard refresh or clear cache

### **Cause 2: Files Not Generated**
**Fix:** Rebuild Docker with `--no-cache`

### **Cause 3: Hash Mismatch**
**Fix:** Clear browser cache + reload

### **Cause 4: Wrong Base Path**
**Fix:** Set `base: './'` in vite.config.mjs

### **Cause 5: Serve Not Running**
**Fix:** Restart Docker container

---

## 🚀 COMPLETE FIX PROCEDURE

If nothing else works, do this:

### **1. Local Machine:**
```bash
cd "E:\Project\KWH Meter\frontend-services\frontend-energy-meter"

# Clean
rm -rf node_modules/.vite build

# Fresh build
npm install
npm run build

# Verify
ls -la build/assets/js/

# Test locally
npx serve -s build -l 3000
# Open: http://localhost:3000
# Check: No errors?

# If OK, commit
git add .
git commit -m "Fix: Rebuild with clean cache"
git push
```

### **2. Server:**
```bash
cd /home/apps/frontend-kwhm

# Pull
git pull

# Complete clean
sudo docker compose down
sudo docker system prune -f
sudo docker volume prune -f

# Rebuild
sudo docker compose build --no-cache
sudo docker compose up -d

# Verify
sudo docker compose logs -f frontend-kwhmeter
```

### **3. Browser:**
```
1. Close ALL browser tabs/windows
2. Kill browser from Task Manager (if Windows)
3. Open browser
4. Ctrl + Shift + Delete → Clear all
5. Access site fresh
```

---

## ✅ SUCCESS INDICATORS

You'll know it's fixed when:

- [ ] ✅ No MIME type errors in console
- [ ] ✅ All JS files load (Network tab shows 200 OK)
- [ ] ✅ Page renders completely
- [ ] ✅ No 404 errors
- [ ] ✅ Navigation works
- [ ] ✅ Console is clean

---

## 📝 PREVENTION

To avoid this in future:

### **1. Always Clear Cache After Deploy**
Add to deployment script:
```bash
# After deploy
echo "⚠️  IMPORTANT: Clear browser cache!"
echo "Press Ctrl + Shift + R in browser"
```

### **2. Use Cache Busting**
Already done! File hashes change on each build:
```
index-abc123.js → index-def456.js
```

### **3. Set Cache Headers (Optional - Nginx)**
```nginx
location /assets/ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}

location / {
  expires -1;
  add_header Cache-Control "no-cache";
}
```

---

## 🆘 LAST RESORT

If NOTHING works:

```bash
# 1. Delete everything
sudo docker compose down -v
sudo docker system prune -a --volumes -f

# 2. Fresh clone
cd /home/apps
sudo rm -rf frontend-kwhm
git clone <your-repo> frontend-kwhm
cd frontend-kwhm

# 3. Build
sudo docker compose build --no-cache
sudo docker compose up -d
```

---

**Remember:** 90% of MIME type errors = **Browser cache issue**!  
**Quick fix:** Ctrl + Shift + R 🚀

