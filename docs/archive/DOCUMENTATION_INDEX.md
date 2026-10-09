# 📚 SmartMenu - Complete Documentation Index

## 🎯 Start Here

**New to SmartMenu?** Start with these documents in order:

1. **[README.md](./README.md)** - Project overview (2 min read)
2. **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Get started in 5 minutes (5 min read)
3. **[INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)** - Setup & API configuration (10 min read)
4. **[DETAILED_SPECIFICATION.md](./DETAILED_SPECIFICATION.md)** - Feature deep dive (20 min read)
5. **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Complete inventory (15 min read)

---

## 📖 Documentation Structure

### Getting Started

- 🚀 **[README.md](./README.md)** - Project introduction
- ⚡ **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Quick setup & testing
- 🔌 **[INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)** - API integration steps

### Technical Documentation

- 📋 **[DETAILED_SPECIFICATION.md](./DETAILED_SPECIFICATION.md)** - Feature specifications & architecture
- 📊 **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Complete project inventory & status
- 📁 **[AGENTS.md](./AGENTS.md)** - Build notes for AI agents
- 💬 **[CLAUDE.md](./CLAUDE.md)** - AI assistant reference

### Configuration

- ⚙️ **[.env.example](./.env.example)** - Environment variables template
- 🎛️ **[tsconfig.json](./tsconfig.json)** - TypeScript configuration
- 🎨 **[tailwind.config.ts](./tailwind.config.ts)** - Tailwind CSS setup
- 📦 **[package.json](./package.json)** - Dependencies & scripts

---

## 🚀 Quick Links by Use Case

### "I want to get the app running locally"

→ Read: [QUICK_REFERENCE.md - Getting Started](./QUICK_REFERENCE.md#-getting-started-5-minutes)

### "I want to test the AR features"

→ Read: [QUICK_REFERENCE.md - Testing Features](./QUICK_REFERENCE.md#-testing-features)

### "I want to integrate with real APIs"

→ Read: [INTEGRATION_GUIDE.md - API Integration Steps](./INTEGRATION_GUIDE.md#api-integration-steps)

### "I want to understand the AI/ML features"

→ Read: [DETAILED_SPECIFICATION.md - Feature Deep Dive](./DETAILED_SPECIFICATION.md#-feature-deep-dive)

### "I want to deploy to production"

→ Read: [INTEGRATION_GUIDE.md - Deployment](./INTEGRATION_GUIDE.md#deployment)

### "I want to understand the project architecture"

→ Read: [PROJECT_SUMMARY.md - Architecture Overview](./PROJECT_SUMMARY.md#-architecture-overview)

### "I need to debug an issue"

→ Read: [QUICK_REFERENCE.md - Debugging](./QUICK_REFERENCE.md#-debugging-tips)

### "I want to see all files created"

→ Read: [PROJECT_SUMMARY.md - File Inventory](./PROJECT_SUMMARY.md#-complete-file-inventory)

---

## 🎯 Feature Documentation

### Customer Features

#### AR Mascot with Adaptive Volume

- **File:** `src/components/customer/ARMascot.tsx`
- **Docs:** [DETAILED_SPECIFICATION.md - Feature 1](./DETAILED_SPECIFICATION.md#1-ai-ar-mascot-with-adaptive-volume)
- **How to test:** [QUICK_REFERENCE.md - Test AR Mascot](./QUICK_REFERENCE.md#test-ar-mascot)
- **Technical details:** [PROJECT_SUMMARY.md - Key Features](./PROJECT_SUMMARY.md#1-ar-mascot-with-adaptive-volume)

#### Vision-Based Dish Recognition

- **File:** `src/components/customer/VisionLens.tsx`
- **Docs:** [DETAILED_SPECIFICATION.md - Feature 2](./DETAILED_SPECIFICATION.md#2-vision-based-dish-recognition)
- **How to test:** [QUICK_REFERENCE.md - Test Vision Recognition](./QUICK_REFERENCE.md#test-vision-recognition)
- **API:** [DETAILED_SPECIFICATION.md - API Endpoint](./DETAILED_SPECIFICATION.md#api-endpoint)

#### Gamified Loyalty (Catch Game)

- **File:** `src/components/customer/IngredientGame.tsx`
- **Docs:** [DETAILED_SPECIFICATION.md - Feature 4](./DETAILED_SPECIFICATION.md#4-gamified-loyalty-system)
- **How to test:** [QUICK_REFERENCE.md - Test Gamified Loyalty](./QUICK_REFERENCE.md#test-gamified-loyalty)
- **Mechanics:** [PROJECT_SUMMARY.md - Key Features](./PROJECT_SUMMARY.md#5-gamified-loyalty-system)

#### Semantic Search & Virtual Sommelier

- **Service:** `src/services/vector-service.ts`
- **Docs:** [DETAILED_SPECIFICATION.md - Feature 3](./DETAILED_SPECIFICATION.md#3-semantic-search--virtual-sommelier)
- **How to test:** [QUICK_REFERENCE.md - Test Semantic Search](./QUICK_REFERENCE.md#test-semantic-search)
- **Architecture:** [PROJECT_SUMMARY.md - Architecture](./PROJECT_SUMMARY.md#how-it-works)

### Admin Features

#### Real-time Table Map

- **File:** `src/components/admin/AdminTableMap.tsx`
- **Docs:** [DETAILED_SPECIFICATION.md - Feature 5](./DETAILED_SPECIFICATION.md#5-admin-real-time-table-map)
- **Technical:** [PROJECT_SUMMARY.md - Key Features](./PROJECT_SUMMARY.md#6-real-time-admin-table-map)

#### Analytics Dashboard

- **File:** `src/components/admin/AdminAnalytics.tsx`
- **Docs:** [DETAILED_SPECIFICATION.md - Feature 6](./DETAILED_SPECIFICATION.md#6-advanced-analytics-dashboard)
- **Metrics:** [PROJECT_SUMMARY.md - Key Features](./PROJECT_SUMMARY.md#7-advanced-analytics-dashboard)

---

## 🔧 Technology Reference

### Frontend Stack

- **Framework:** [Next.js 16](https://nextjs.org/) - App Router
- **UI Library:** [React 19](https://react.dev/)
- **Language:** [TypeScript 5](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Components:** [Shadcn UI](https://ui.shadcn.com/)
- **State:** [Zustand](https://github.com/pmndrs/zustand)

### Backend Services

- **API:** Next.js API Routes
- **Database:** [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **ODM:** [Mongoose 8](https://mongoosejs.com/)
- **Validation:** [Zod 4](https://zod.dev/)
- **Real-time:** Pusher / WebSocket

### AI/ML Services

- **Vision:** [Gemini 1.5 Flash](https://ai.google.dev/)
- **Embeddings:** [OpenAI](https://platform.openai.com/)
- **Search:** [MongoDB Vector Search](https://www.mongodb.com/docs/atlas/atlas-vector-search/)

### WebAR/3D

- **3D Framework:** [A-Frame 1.4](https://aframe.io/)
- **AR Tracking:** [Mind-AR](https://hiukim.github.io/mind-ar-js/)
- **Audio API:** Web Audio API
- **Speech API:** Web Speech API

### Development Tools

- **Linter:** ESLint
- **Formatter:** Prettier
- **Build:** Next.js built-in
- **Package Manager:** npm

---

## 📋 Database Reference

### Collections & Schemas

#### Products

```javascript
{
  name, description, price, category,
  embeddings: [], tags: [], pros: [], cons: [],
  arModelUrl, isAvailable, createdAt
}
```

→ [PROJECT_SUMMARY.md - Product Schema](./PROJECT_SUMMARY.md#product-enhanced)

#### Orders

```javascript
{
  tableId, items[], gameScore, discount,
  discountCode, paymentStatus, status,
  totalAmount, amountAfterDiscount
}
```

→ [PROJECT_SUMMARY.md - Order Schema](./PROJECT_SUMMARY.md#order-enhanced)

#### Tables

```javascript
{
  (tableNumber, capacity, status, currentGuests, activeOrderId, lastUpdated);
}
```

→ [PROJECT_SUMMARY.md - Table Schema](./PROJECT_SUMMARY.md#table-enhanced)

---

## 🌐 API Reference

### AI & Search

- `POST /api/ai` - Semantic search & Virtual Sommelier
- `GET /api/ai?q=query` - Vector search

→ [DETAILED_SPECIFICATION.md - API Endpoints](./DETAILED_SPECIFICATION.md#3-semantic-search--virtual-sommelier)

### Vision Recognition

- `POST /api/vision` - Dish recognition

→ [DETAILED_SPECIFICATION.md - API Endpoint](./DETAILED_SPECIFICATION.md#2-vision-based-dish-recognition)

### Order Management

- `GET /api/orders` - List orders
- `POST /api/orders` - Create order
- `PUT /api/orders/[id]` - Update order

### Tables

- `GET /api/tables` - List tables
- `PUT /api/tables/[id]` - Update table status

---

## 🗂️ File Structure Reference

```
smartmenu/
├── src/
│   ├── app/
│   │   ├── (admin)/          → Admin routes
│   │   ├── (customer)/       → Customer routes
│   │   ├── api/              → API endpoints
│   │   ├── layout.tsx        → Root layout
│   │   └── page.tsx          → Home page
│   ├── components/
│   │   ├── customer/         → Customer AR components
│   │   ├── admin/            → Admin dashboard components
│   │   └── ui/               → Shadcn UI components
│   ├── services/             → Business logic (vector, vision)
│   ├── lib/
│   │   ├── ai-config.ts      → LLM configuration
│   │   ├── websocket.ts      → WebSocket manager
│   │   └── validations/      → Zod schemas
│   ├── store/                → Zustand state stores
│   ├── hooks/                → Custom React hooks
│   └── types/                → TypeScript types
├── public/
│   ├── sw.js                 → Service Worker
│   └── manifest.json         → PWA manifest
├── docs/
│   ├── README.md
│   ├── PROJECT_SUMMARY.md
│   ├── DETAILED_SPECIFICATION.md
│   ├── INTEGRATION_GUIDE.md
│   └── QUICK_REFERENCE.md
└── .env.example              → Environment template
```

→ [PROJECT_SUMMARY.md - File Inventory](./PROJECT_SUMMARY.md#-complete-file-inventory)

---

## 🔐 Environment Variables

### Required

- `MONGODB_URI` - Database connection
- `GEMINI_API_KEY` - Vision & LLM
- `DB_NAME` - Database name

### Recommended

- `OPENAI_API_KEY` - Embeddings alternative
- `NEXT_PUBLIC_AI_PROVIDER` - Which LLM to use

### Optional

- `PUSHER_KEY` - Real-time updates
- `JWT_SECRET` - Admin auth
- `NEXT_PUBLIC_DEBUG` - Debug mode

→ [INTEGRATION_GUIDE.md - Configuration](./INTEGRATION_GUIDE.md#2-configure-environment-variables)

---

## 🐛 Troubleshooting Guide

### Common Issues

| Issue                     | Solution                                                                          |
| ------------------------- | --------------------------------------------------------------------------------- |
| Module not found          | [QUICK_REFERENCE.md - Debugging](./QUICK_REFERENCE.md#-debugging-tips)            |
| API not responding        | [QUICK_REFERENCE.md - Error Resolution](./QUICK_REFERENCE.md#-error-resolution)   |
| Database connection error | [INTEGRATION_GUIDE.md - Troubleshooting](./INTEGRATION_GUIDE.md#troubleshooting)  |
| Features not working      | [QUICK_REFERENCE.md - Feature Checklist](./QUICK_REFERENCE.md#-feature-checklist) |

---

## 📊 Testing Guide

### Feature Testing

- AR Mascot → [QUICK_REFERENCE.md](./QUICK_REFERENCE.md#test-ar-mascot)
- Vision Lens → [QUICK_REFERENCE.md](./QUICK_REFERENCE.md#test-vision-recognition)
- Gamified Loyalty → [QUICK_REFERENCE.md](./QUICK_REFERENCE.md#test-gamified-loyalty)
- Admin Dashboard → [QUICK_REFERENCE.md](./QUICK_REFERENCE.md#test-admin-dashboard)

### Checklist

- [QUICK_REFERENCE.md - Feature Checklist](./QUICK_REFERENCE.md#-feature-checklist)
- [QUICK_REFERENCE.md - Deployment Checklist](./QUICK_REFERENCE.md#-deployment-checklist)

---

## 🚀 Deployment Guide

### Local Development

→ [QUICK_REFERENCE.md - Getting Started](./QUICK_REFERENCE.md#-getting-started-5-minutes)

### Production Deployment

→ [INTEGRATION_GUIDE.md - Deployment](./INTEGRATION_GUIDE.md#deployment)

### Docker Deployment

→ [INTEGRATION_GUIDE.md - Docker](./INTEGRATION_GUIDE.md#docker-deployment)

---

## 📚 Additional Resources

### Official Documentation

- [Next.js Official Docs](https://nextjs.org/docs)
- [MongoDB Official Docs](https://docs.mongodb.com)
- [Gemini API Docs](https://ai.google.dev/docs)
- [React Official Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Learning Resources

- [A-Frame School](https://aframe.io/school/)
- [Web Audio API Guide](https://developer.mozilla.org/en-US/docs/Web_Audio_API)
- [Web AR Best Practices](https://www.w3.org/TR/webxr/)

---

## 📞 Help & Support

### Where to Find Help

1. **Setup Issues** → [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
2. **Feature Questions** → [DETAILED_SPECIFICATION.md](./DETAILED_SPECIFICATION.md)
3. **Debugging** → [QUICK_REFERENCE.md - Debugging](./QUICK_REFERENCE.md#-debugging-tips)
4. **Architecture** → [PROJECT_SUMMARY.md - Architecture](./PROJECT_SUMMARY.md#-architecture-overview)

### Error Messages

- Check [QUICK_REFERENCE.md - Error Resolution](./QUICK_REFERENCE.md#-error-resolution)
- See browser console for detailed errors
- Check terminal output from `npm run dev`

---

## ✅ Project Status

| Component       | Status      | Docs                                                     |
| --------------- | ----------- | -------------------------------------------------------- |
| Core Setup      | ✅ Complete | [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)               |
| AR Features     | ✅ Complete | [DETAILED_SPECIFICATION.md](./DETAILED_SPECIFICATION.md) |
| AI/ML Services  | ✅ Complete | [DETAILED_SPECIFICATION.md](./DETAILED_SPECIFICATION.md) |
| Admin Dashboard | ✅ Complete | [DETAILED_SPECIFICATION.md](./DETAILED_SPECIFICATION.md) |
| Database Layer  | ✅ Complete | [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)               |
| API Routes      | ✅ Complete | [DETAILED_SPECIFICATION.md](./DETAILED_SPECIFICATION.md) |
| PWA & Offline   | ✅ Complete | [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)               |

---

## 📄 Document Versions

| Document                  | Version | Last Updated   |
| ------------------------- | ------- | -------------- |
| README.md                 | 1.0.0   | April 24, 2026 |
| PROJECT_SUMMARY.md        | 1.0.0   | April 24, 2026 |
| DETAILED_SPECIFICATION.md | 1.0.0   | April 24, 2026 |
| INTEGRATION_GUIDE.md      | 1.0.0   | April 24, 2026 |
| QUICK_REFERENCE.md        | 1.0.0   | April 24, 2026 |
| DOCUMENTATION_INDEX.md    | 1.0.0   | April 24, 2026 |

---

## 🎯 Recommended Reading Order

**For First-Time Users:**

1. README.md (overview)
2. QUICK_REFERENCE.md (setup)
3. Try a feature (test it)
4. INTEGRATION_GUIDE.md (if issues)

**For Developers:**

1. QUICK_REFERENCE.md (get running)
2. PROJECT_SUMMARY.md (understand structure)
3. DETAILED_SPECIFICATION.md (feature details)
4. Relevant component files

**For Deployment:**

1. INTEGRATION_GUIDE.md (setup)
2. QUICK_REFERENCE.md (checklist)
3. Deploy to Vercel/Docker

**For Troubleshooting:**

1. QUICK_REFERENCE.md (common issues)
2. INTEGRATION_GUIDE.md (setup issues)
3. Browser console (error details)
4. Terminal output (build errors)

---

**🎓 Happy Building! | 📖 Last Updated: April 24, 2026 | ✅ Status: Complete**
