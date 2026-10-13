# ⚡ Quick Start - Rebuild Docker

## 🎯 Cara Rebuild yang Benar (SINGKAT)

### **Metode 1: Docker Compose (RECOMMENDED)**

```bash
# Stop & rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Check logs
docker-compose logs -f frontend-kwhmeter
```

**Done!** ✅ Akses `http://localhost:3000`

---

### **Metode 2: Docker CLI**

```bash
# Clean up
docker stop frontend-kwhmeter
docker rm frontend-kwhmeter
docker rmi frontend-kwhmeter

# Build & run
docker build --no-cache -t frontend-kwhmeter:latest .
docker run -d --name frontend-kwhmeter -p 3000:3000 --restart always frontend-kwhmeter:latest

# Check
docker logs -f frontend-kwhmeter
```

**Done!** ✅ Akses `http://localhost:3000`

---

## 📋 Perubahan File

### ✅ File yang Sudah Diubah:
1. **`Dockerfile`** - Production optimized dengan multi-stage build
2. **`vite.config.mjs`** - Build optimization (minification, code splitting)
3. **`.dockerignore`** - Exclude unnecessary files (NEW)

### 📄 File yang TIDAK Perlu Diubah:
- `docker-compose.yaml` - Sudah OK!
- `package.json` - Sudah OK!

---

## 🚀 Build Time

| Build Type | Time | Image Size |
|------------|------|------------|
| **First build (no cache)** | 3-4 min | ~150 MB |
| **Rebuild (with cache)** | 30-60 sec | ~150 MB |
| **Old Dockerfile** | 2-3 min | ~1.5 GB |

---

## ✅ Verification (After Rebuild)

```bash
# 1. Check container running
docker ps | grep frontend-kwhmeter

# 2. Check logs (should see: "Accepting connections at http://localhost:3000")
docker logs frontend-kwhmeter

# 3. Test endpoint
curl http://localhost:3000

# 4. Check bundle files inside container
docker exec -it frontend-kwhmeter ls -lh build/assets/js/

# Should see multiple chunks:
# vendor-react-*.js
# vendor-coreui-*.js
# vendor-datatable-*.js
# etc.
```

---

## ⚠️ Troubleshooting

### Error: "Port already in use"
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Then rebuild
docker-compose up -d
```

### Error: "Build failed"
```bash
# Clear everything and rebuild
docker-compose down
docker system prune -f
npm cache clean --force
docker-compose build --no-cache
docker-compose up -d
```

### Error: "404 Not Found"
```bash
# Check if build folder exists
docker exec -it frontend-kwhmeter ls -la build/

# If empty, rebuild locally first
npm run build
docker-compose build --no-cache
docker-compose up -d
```

---

## 📊 Expected Results

### Performance:
- ✅ LCP: **1.2-1.8s** (dari 4.5-6.0s)
- ✅ Bundle: **~800 KB** (dari 2.8 MB)
- ✅ Memory: **~80 MB** (dari ~500 MB)
- ✅ Startup: **2-3s** (dari 15-20s)

### Files:
```
build/
├── assets/
│   ├── js/
│   │   ├── vendor-react-[hash].js      (~150 KB)
│   │   ├── vendor-coreui-[hash].js     (~200 KB)
│   │   ├── vendor-datatable-[hash].js  (~180 KB)
│   │   ├── vendor-chart-[hash].js      (~120 KB)
│   │   ├── vendor-utils-[hash].js      (~100 KB)
│   │   └── main-[hash].js              (~50 KB)
│   └── css/
│       └── main-[hash].css
├── index.html
└── manifest.json
```

---

## 📚 Dokumentasi Lengkap

Baca file berikut untuk detail:
- **`DOCKER_REBUILD_GUIDE.md`** - Panduan lengkap rebuild
- **`LCP_OPTIMIZATION_GUIDE.md`** - Penjelasan optimization
- **`LAZY_LOADING_EXAMPLE.md`** - Contoh lazy loading

---

**Ready to rebuild?** Run: `docker-compose up --build -d` 🚀

