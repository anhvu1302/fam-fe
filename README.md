# Fixed Asset Management - Frontend

Next.js application cho hệ thống quản lý tài sản cố định với **bảo mật đa lớp**.

## 🚀 Getting Started

### Development

```bash
# Install dependencies
pnpm install

# Setup environment
cp .env.example .env.local
# Edit .env.local với secret keys (xem Security Setup)

# Run development server
pnpm dev
```

Open [http://localhost:8001](http://localhost:8001) with your browser.

### Build for Production

```bash
pnpm build
pnpm start
```

## 🔐 Security Features

Hệ thống có **4 lớp bảo mật** để bảo vệ API và dữ liệu:

| Feature | Status | Document |
|---------|:------:|----------|
| **AES-256 Encryption** | ✅ | [SECURITY.md](./SECURITY.md) |
| **Replay Attack Protection** | ✅ | [SECURITY.md](./SECURITY.md) |
| **Direct Access Protection** | ✅ | [DIRECT-ACCESS-PROTECTION.md](./DIRECT-ACCESS-PROTECTION.md) |
| **HMAC Integrity Check** | ✅ | [SECURITY.md](./SECURITY.md) |

### Quick Security Setup

```env
# .env.local
NEXT_PUBLIC_CRYPTO_KEY="generate-with-openssl-rand-32"
NEXT_PUBLIC_APP_SIGNATURE_KEY="another-secret-key"
ALLOWED_ORIGINS="http://localhost:8001,https://your-domain.com"
```

📖 **[Security Overview](./SECURITY-OVERVIEW.md)** - Đọc để hiểu toàn bộ hệ thống bảo mật

## 🛡️ What's Protected

- ✅ **Copy URL gọi từ Postman/curl** → Bị chặn
- ✅ **Gửi lại request cũ (replay)** → Bị chặn
- ✅ **Sửa đổi dữ liệu giữa đường** → Bị phát hiện
- ✅ **Cross-origin attacks** → Bị chặn

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/          # Auth pages (login, register)
│   ├── (main)/          # Main app pages
│   └── api/proxy/       # Secure API proxy ⭐
├── components/          # React components
├── lib/
│   ├── crypto.ts        # Encryption & replay protection ⭐
│   ├── app-signature.ts # Direct access protection ⭐
│   └── axios-client.ts  # HTTP client with auto security ⭐
└── types/               # TypeScript types
```

## 🔧 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: Ant Design 5
- **HTTP Client**: Axios với auto encryption
- **Encryption**: CryptoJS (AES-256-CBC + HMAC-SHA256)
- **Language**: TypeScript

## 📚 Documentation

- **[SECURITY-OVERVIEW.md](./SECURITY-OVERVIEW.md)** - Tổng quan bảo mật
- **[SECURITY.md](./SECURITY.md)** - Chi tiết encryption & replay protection
- **[SECURITY-SETUP.md](./SECURITY-SETUP.md)** - Hướng dẫn setup nhanh
- **[DIRECT-ACCESS-PROTECTION.md](./DIRECT-ACCESS-PROTECTION.md)** - Chi tiết access control

## 🧪 Testing

```bash
# Test replay attack protection
npx ts-node scripts/test-replay-attack.ts

# Test direct access (should fail)
curl http://localhost:8001/api/proxy/api/settings/public
# Expected: 403 Forbidden
```

## 🚀 Production Deployment

1. **Generate secret keys**:
   ```bash
   openssl rand -base64 32  # CRYPTO_KEY
   openssl rand -base64 32  # APP_SIGNATURE_KEY
   ```

2. **Set environment variables**:
   - `NEXT_PUBLIC_CRYPTO_KEY`
   - `NEXT_PUBLIC_APP_SIGNATURE_KEY`
   - `ALLOWED_ORIGINS`
   - `BACKEND_API_URL`

3. **Enable HTTPS** (bắt buộc cho production)

4. **Consider Redis** cho nonce store (scalability)

📋 Xem chi tiết: [Production Checklist](./SECURITY-OVERVIEW.md#-production-checklist)

## 🤝 Contributing

This is a private project. For questions, contact the development team.

## 📝 License

Private - All rights reserved.
