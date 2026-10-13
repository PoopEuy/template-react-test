# Docker Quick Reference Card 🚀

## Setup Pertama Kali

```bash
# 1. Copy template
cp docker-compose.yaml.template docker-compose.yaml

# 2. Tambahkan BUILD_MODE ke .env
echo "BUILD_MODE=development" >> .env

# 3. Run
docker-compose up --build -d
```

---

## Daily Commands

```bash
# Build & Start
docker-compose up --build -d

# Stop
docker-compose down

# Restart
docker-compose restart

# View Logs
docker-compose logs -f

# Rebuild (fresh)
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

## File .env Configuration

Tambahkan baris ini ke file `.env`:

```env
# Runtime
PORT=3000

# Build Mode
BUILD_MODE=development  # atau production
```

---

## Troubleshooting

**Build mode salah?**
```bash
cat .env | grep BUILD_MODE
# Harus ada: BUILD_MODE=development
```

**Container error?**
```bash
docker-compose logs -f
```

**Reset semua?**
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

## Penjelasan BUILD_MODE

| Mode | File Config | Untuk |
|------|-------------|-------|
| `development` | `.env.development` | Server 226 |
| `production` | `.env.production` | Server 223 |

---

## Git Workflow

**Ketika pull dari Git:**
```bash
git pull
# File docker-compose.yaml Anda TIDAK akan berubah (sudah gitignored)
```

**Jika ada update template:**
```bash
git pull
cp docker-compose.yaml.template docker-compose.yaml
# Edit jika perlu
docker-compose up --build -d
```

---

📖 **Dokumentasi Lengkap**: [`DOCKER_SETUP.md`](DOCKER_SETUP.md)

