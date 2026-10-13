# 🚀 Deployment Setup Guide

## 📋 Cara Kerja

### File Structure:
```
📦 Di Git (Shared)
├── .env.development         → Config untuk server 226 ✅
├── .env.production          → Config untuk server 223 ✅
├── .env.local.example       → Template config ✅
├── Dockerfile               → Build script ✅
├── docker-compose.yaml      → Deployment config ✅
└── .gitignore               → Ignore .env.local ✅

📁 Server Dev 226 (Not in Git)
├── .env.local               → BUILD_MODE=development ❌
└── .env                     → Symlink ke .env.development ❌

📁 Server Prod 223 (Not in Git)
├── .env.local               → BUILD_MODE=production ❌
└── .env                     → Symlink ke .env.production ❌
```

### Alur Build:
```
1. docker-compose.yaml membaca BUILD_MODE dari .env.local
2. Dockerfile menerima BUILD_MODE sebagai ARG
3. npm run build --mode ${BUILD_MODE}
4. Vite membaca file sesuai mode:
   - development → .env.development (226)
   - production → .env.production (223)
```

---

## 🖥️ Setup Server Dev (226)

### 1. SSH ke Server:
```bash
ssh talis@192.168.100.226
cd /path/to/project
```

### 2. Pull Latest Code:
```bash
git pull origin master
```

### 3. Setup File `.env.local`:
```bash
# Copy dari template
cp .env.local.example .env.local

# Edit untuk development
nano .env.local
```

Isi file `.env.local`:
```bash
BUILD_MODE=development
```

Save dan exit.

### 4. Setup File `.env` (Symlink):
```bash
# Link ke .env.development
ln -sf .env.development .env

# Verify
ls -la .env
# Output harus: .env -> .env.development
```

### 5. Deploy:
```bash
# Build dan start
docker compose down
docker compose build --no-cache
docker compose up -d

# Check logs
docker compose logs -f --tail=50
```

### 6. Verify:
```bash
# Cek BUILD_MODE
cat .env.local

# Cek environment di container
docker exec frontend-kwhmeter grep -o "192.168.100.[0-9]*" /usr/src/app/build/index.html | head -1
# Harus output: 192.168.100.226
```

---

## 🏭 Setup Server Prod (223)

### 1. SSH ke Server:
```bash
ssh kwh@192.168.100.223
cd /path/to/project
```

### 2. Pull Latest Code:
```bash
git pull origin master
```

### 3. Setup File `.env.local`:
```bash
# Copy dari template
cp .env.local.example .env.local

# Edit untuk production
nano .env.local
```

Isi file `.env.local`:
```bash
BUILD_MODE=production
```

Save dan exit.

### 4. Setup File `.env` (Symlink):
```bash
# Link ke .env.production
ln -sf .env.production .env

# Verify
ls -la .env
# Output harus: .env -> .env.production
```

### 5. Deploy:
```bash
# Build dan start
docker compose down
docker compose build --no-cache
docker compose up -d

# Check logs
docker compose logs -f --tail=50
```

### 6. Verify:
```bash
# Cek BUILD_MODE
cat .env.local

# Cek environment di container
docker exec frontend-kwhmeter grep -o "192.168.100.[0-9]*" /usr/src/app/build/index.html | head -1
# Harus output: 192.168.100.223
```

---

## 🔄 Setup Git Hooks (Auto Deploy)

### Server Dev (226):

Edit `/home/apps/frontend-kwhm/hooks/post-receive`:

```bash
#!/bin/bash

# Configuration
GIT_WORK_TREE=/path/to/deploy
export GIT_DIR=/home/apps/frontend-kwhm

echo "📦 Deploying to Development Server (226)..."

# Checkout latest code
git --work-tree=$GIT_WORK_TREE --git-dir=$GIT_DIR checkout -f

# Go to working directory
cd $GIT_WORK_TREE

echo "🔄 Pulling latest changes..."
git pull origin master

# .env.local sudah ada di server (tidak akan tertimpa karena di-gitignore)
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local tidak ditemukan! Membuat dari template..."
    cp .env.local.example .env.local
    echo "BUILD_MODE=development" > .env.local
fi

# Docker compose akan otomatis baca BUILD_MODE dari .env.local
echo "🚀 Building and deploying..."
docker compose down
docker compose build --no-cache
docker compose up -d

echo "✅ Deployment completed!"
docker compose ps

# Show config
echo ""
echo "📋 Current Configuration:"
cat .env.local
```

Set executable:
```bash
chmod +x /home/apps/frontend-kwhm/hooks/post-receive
```

---

### Server Prod (223):

Edit `/home/kwh/frontend/apps/hooks/post-receive`:

```bash
#!/bin/bash

# Configuration
GIT_WORK_TREE=/path/to/deploy
export GIT_DIR=/home/kwh/frontend/apps

echo "📦 Deploying to Production Server (223)..."

# Checkout latest code
git --work-tree=$GIT_WORK_TREE --git-dir=$GIT_DIR checkout -f

# Go to working directory
cd $GIT_WORK_TREE

echo "🔄 Pulling latest changes..."
git pull origin master

# .env.local sudah ada di server (tidak akan tertimpa karena di-gitignore)
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local tidak ditemukan! Membuat dari template..."
    cp .env.local.example .env.local
    echo "BUILD_MODE=production" > .env.local
fi

# Docker compose akan otomatis baca BUILD_MODE dari .env.local
echo "🚀 Building and deploying..."
docker compose down
docker compose build --no-cache
docker compose up -d

echo "✅ Deployment completed!"
docker compose ps

# Show config
echo ""
echo "📋 Current Configuration:"
cat .env.local
```

Set executable:
```bash
chmod +x /home/kwh/frontend/apps/hooks/post-receive
```

---

## 🎯 Cara Deploy

### Deploy Manual:

**Di Server:**
```bash
cd /path/to/project
git pull origin master
docker compose up -d --build
```

Docker Compose akan **otomatis membaca** `.env.local` untuk mendapatkan BUILD_MODE!

### Deploy via Git Push (Auto):

**Dari Local:**
```bash
# Commit changes
git add .
git commit -m "Your changes"
git push origin master

# Deploy ke dev (otomatis build dengan development mode)
git push dev master

# Deploy ke prod (otomatis build dengan production mode)
git push prod master
```

---

## 🔍 Troubleshooting

### Masalah: Container masih call IP yang salah

```bash
# 1. Cek .env.local
cat .env.local

# 2. Pastikan BUILD_MODE benar
# Dev harus: BUILD_MODE=development
# Prod harus: BUILD_MODE=production

# 3. Cek symlink .env
ls -la .env

# 4. Rebuild tanpa cache
docker compose down
docker rm -f frontend-kwhmeter
docker compose build --no-cache
docker compose up -d
```

### Masalah: File .env.local tidak ada setelah pull

Ini **NORMAL** karena `.env.local` di-gitignore. Setup sekali saja:

```bash
cp .env.local.example .env.local

# Untuk dev:
echo "BUILD_MODE=development" > .env.local

# Untuk prod:
echo "BUILD_MODE=production" > .env.local
```

---

## ✅ Keuntungan Setup Ini

1. **Tidak Tertimpa** - `.env.local` di-gitignore, aman dari pull/push
2. **Auto-Read** - Docker Compose langsung baca BUILD_MODE
3. **Simple Command** - Cukup `docker compose up -d --build`
4. **Per-Server Config** - Setiap server punya config sendiri
5. **Zero Manual** - Tidak perlu ketik BUILD_MODE manual

---

## 📞 Support

Cek logs jika ada error:
```bash
docker compose logs -f --tail=100
```

Verify config:
```bash
cat .env.local
ls -la .env
docker compose config
```

