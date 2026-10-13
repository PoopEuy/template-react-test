# 🔧 Fix SPA Routing - MIME Type Error on Refresh

## 🚨 Problem

Error muncul saat refresh di route selain root:
```
Failed to load module script: Expected a JavaScript-or-Wasm module script 
but the server responded with a MIME type of "text/html".
```

**Terjadi di:**
- ✅ Root `/` → OK
- ❌ `/dashboard` → Error saat refresh
- ❌ `/receiving/purchaseOrder` → Error saat refresh

---

## 🔍 Root Cause

### **Scenario:**

1. User navigate ke `/receiving/purchaseOrder` (via React Router → OK)
2. User refresh page (Ctrl+R)
3. Browser request ke server: `GET /receiving/purchaseOrder`
4. Server return `index.html` (SPA mode)
5. HTML load JS dengan path: `./assets/js/index-abc.js`
6. Browser resolve path: `/receiving/assets/js/index-abc.js` ❌ (WRONG!)
7. File not found → Server return HTML (404 page)
8. Browser expect JS but get HTML → **MIME type error!**

### **Diagram:**

```
WRONG (base: './'):
URL: /receiving/purchaseOrder
JS:  ./assets/js/main.js  →  /receiving/assets/js/main.js  ❌

CORRECT (base: '/'):
URL: /receiving/purchaseOrder
JS:  /assets/js/main.js   →  /assets/js/main.js  ✅
```

---

## ✅ Solutions Applied

### **Fix 1: Vite Base Path**

**Changed:**
```javascript
// vite.config.mjs
base: './',  // ❌ Relative path
```

**To:**
```javascript
base: '/',   // ✅ Absolute path
```

**Why:** Assets always load from root, regardless of current route.

---

### **Fix 2: Express Server for SPA**

**Created:** `server-spa.js`

```javascript
const express = require('express');
const path = require('path');

app.use(express.static('build'));

// SPA fallback: all routes return index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
```

**Why:** 
- Proper MIME type handling
- Reliable SPA routing fallback
- Better than `serve` package for production

---

### **Fix 3: Updated Dockerfile**

**Changed:**
```dockerfile
CMD ["serve", "-s", "build", "-l", "3000"]  # ❌ Sometimes unreliable
```

**To:**
```dockerfile
CMD ["node", "server-spa.js"]  # ✅ Reliable Express server
```

---

## 🚀 Deploy Steps

### **1. Commit Changes**

```bash
# Local machine
git add vite.config.mjs Dockerfile server-spa.js package.json
git commit -m "Fix: SPA routing with absolute base path and Express server"
git push origin master
```

### **2. Rebuild on Server**

```bash
# Server
cd /home/apps/frontend-kwhm
git pull origin master

# Clean rebuild
sudo docker compose down
sudo docker compose build --no-cache
sudo docker compose up -d

# Monitor logs
sudo docker compose logs -f frontend-kwhmeter
```

**Expected output:**
```
✅ Server running on http://0.0.0.0:3000
✅ Serving SPA from: /usr/src/app/build
```

### **3. Test in Browser**

```
1. Clear cache: Ctrl + Shift + Delete
2. Open: http://192.168.100.226:3000
3. Navigate to: /receiving/purchaseOrder
4. Refresh: Ctrl + R
5. ✅ Should work without MIME error!
```

---

## ✅ Verification Checklist

Test these scenarios:

- [ ] ✅ Root (`/`) loads
- [ ] ✅ Navigate to `/dashboard` → works
- [ ] ✅ Refresh at `/dashboard` → no error
- [ ] ✅ Navigate to `/receiving/purchaseOrder` → works
- [ ] ✅ Refresh at `/receiving/purchaseOrder` → no error
- [ ] ✅ Deep link (paste URL directly) → works
- [ ] ✅ Browser back button → works
- [ ] ✅ All assets load (CSS, JS, images)

---

## 🔍 Debug if Still Error

### **Check 1: Verify Base Path in Build**

```bash
# Check index.html
sudo docker exec -it frontend-kwhmeter cat build/index.html | grep "script src"

# Expected:
# <script type="module" src="/assets/js/index-abc.js"></script>
#                             ↑ Absolute path (starts with /)

# NOT:
# <script type="module" src="./assets/js/index-abc.js"></script>
#                             ↑ Relative path (starts with ./)
```

### **Check 2: Test Express Server**

```bash
# Enter container
sudo docker exec -it frontend-kwhmeter sh

# Test server
curl http://localhost:3000/
curl http://localhost:3000/dashboard
curl http://localhost:3000/receiving/purchaseOrder

# All should return HTML (index.html)
```

### **Check 3: Browser DevTools**

```
1. F12 → Network tab
2. Navigate to /dashboard
3. Refresh
4. Check JS file request:
   - URL should be: /assets/js/index-abc.js  ✅
   - NOT: /dashboard/assets/js/index-abc.js  ❌
5. Response should be JS code, not HTML
```

---

## 🎯 Expected Results

### **Before Fix:**

```
Navigate: http://192.168.100.226:3000/dashboard
Status: ✅ OK

Refresh: Ctrl+R
Status: ❌ MIME type error
Console: Failed to load module script...
```

### **After Fix:**

```
Navigate: http://192.168.100.226:3000/dashboard
Status: ✅ OK

Refresh: Ctrl+R
Status: ✅ OK
Console: No errors
```

---

## 📚 Technical Background

### **SPA (Single Page Application) Routing:**

```
Traditional Server:
/dashboard        → dashboard.html
/receiving/order  → receiving/order.html

SPA (React):
/dashboard        → index.html (React Router handles route)
/receiving/order  → index.html (React Router handles route)
```

**Key:** Server must return `index.html` for ALL routes!

### **Asset Path Resolution:**

```
HTML at: /dashboard
Script: <script src="./main.js">
Browser resolves: /dashboard/main.js  ❌

HTML at: /dashboard
Script: <script src="/main.js">
Browser resolves: /main.js  ✅
```

**Key:** Use absolute paths (`/`) not relative (`./`)!

---

## 🛡️ Prevention

For future deployments:

1. ✅ Always use `base: '/'` in `vite.config.mjs`
2. ✅ Use proper SPA server (Express, Nginx, Apache with rewrite)
3. ✅ Test deep routes with refresh before deploying
4. ✅ Check `index.html` for absolute asset paths

---

## 🆘 Alternative Solutions

### **Option A: Nginx (Production Grade)**

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static assets with caching
    location ~* ^/assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### **Option B: Serve with Correct Flags**

```dockerfile
CMD ["serve", "-s", "build", "-l", "3000", "--no-clipboard", "--cors"]
```

**Note:** Current Express solution is more reliable!

---

**Status:** ✅ Fixed with Express server + absolute base path  
**Next:** Rebuild and test!

