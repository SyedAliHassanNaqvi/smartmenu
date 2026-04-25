# SmartMenu - Complete Project Setup Guide

## 📋 Project Overview

SmartMenu is a comprehensive AI-powered restaurant ordering system built with **Next.js 16 (App Router)**, **MongoDB**, **Mongoose**, **Zod validation**, **Shadcn UI**, **Zustand**, and **PWA capabilities**.

### ✨ Features Implemented

- ✅ **Next.js App Router** with grouped routes for admin & customer sections
- ✅ **MongoDB + Mongoose** integration with connection pooling
- ✅ **Zod Validation** for all forms and API requests
- ✅ **Shadcn UI Components** (Button, Card, Badge, Input, Table)
- ✅ **Dynamic Routing** - `/[tableId]` for customer entry points
- ✅ **State Management** - Zustand stores for orders, tables, and auth
- ✅ **Custom Hooks** - Audio analyzer, speech recognition, cart management
- ✅ **API Routes** - AI semantic search, Vision recognition, Order management
- ✅ **Service Worker** - PWA support with offline caching & background sync
- ✅ **Web Manifest** - Installable PWA with icons and shortcuts
- ✅ **Offline HTML** - Graceful offline page with stored data info

## 📁 Project Structure

```
src/
├── app/
│   ├── (admin)/                 # Admin Dashboard Routes
│   │   ├── layout.tsx          # Admin sidebar layout
│   │   ├── dashboard/page.tsx  # Stats & Analytics
│   │   ├── menu/page.tsx       # Product CRUD
│   │   └── tables/page.tsx     # Table Management & QR Codes
│   ├── (customer)/              # Customer Routes
│   │   ├── layout.tsx          # Customer header layout
│   │   ├── [tableId]/page.tsx  # Main ordering interface
│   │   └── ar-view/page.tsx    # AR Menu Explorer
│   ├── api/
│   │   ├── ai/route.ts         # Semantic search & chat
│   │   ├── vision/route.ts     # Image recognition
│   │   └── orders/route.ts     # Order CRUD
│   ├── layout.tsx              # Root layout with PWA setup
│   ├── page.tsx                # Landing page
│   └── globals.css             # Global styles
├── components/
│   ├── ui/                     # Shadcn components (atomic)
│   ├── shared/                 # Reusable components
│   ├── admin/                  # Admin-specific components
│   └── customer/               # Customer-specific components
├── hooks/                      # Custom React hooks
│   ├── use-audio-analyzer.ts
│   ├── use-speech.ts
│   └── use-cart.ts
├── lib/
│   ├── db.ts                   # MongoDB connection
│   ├── models/                 # Mongoose schemas
│   └── validations/            # Zod schemas
├── store/                      # Zustand stores
│   ├── use-order-store.ts
│   ├── use-table-store.ts
│   └── use-auth-store.ts
├── types/
│   └── models.ts              # TypeScript interfaces
├── utils/
│   ├── cn.ts                  # Tailwind class utilities
│   └── helpers.ts             # Utility functions
└── public/
    ├── sw.js                  # Service Worker
    ├── manifest.json          # PWA manifest
    └── offline.html           # Offline fallback page
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or cloud instance)
- VS Code (optional)

### Installation

1. **Clone and navigate to project:**

```bash
cd c:\Dev\FYP\SmartMenu\smartmenu
```

2. **Install dependencies:**

```bash
npm install
```

3. **Configure environment variables:**

```bash
cp .env.example .env.local
# Edit .env.local with your MongoDB URI and other settings
```

4. **Start development server:**

```bash
npm run dev
```

5. **Open in browser:**

```
http://localhost:3000
```

## 📚 Database Setup

### MongoDB Connection

The project uses Mongoose for MongoDB connectivity. Update your `.env.local`:

```env
MONGODB_URI=mongodb://localhost:27017/smartmenu
DB_NAME=smartmenu
```

### Collections Created

The application automatically creates these collections:

- **Products** - Menu items with pricing, images, ratings
- **Orders** - Customer orders with items and status tracking
- **Tables** - Restaurant table management and occupancy
- **Users** - Admin/staff authentication (future)

## 🛣️ Route Guide

### Admin Routes

```
/admin/dashboard     - Statistics & analytics
/admin/menu         - Product management (CRUD)
/admin/tables       - Table management & QR code generation
```

### Customer Routes

```
/customer/[tableId] - Main menu ordering (dynamic entry point via QR)
/customer/ar-view   - AR menu exploration with mascot & games
```

### API Routes

```
POST   /api/orders              - Create order
GET    /api/orders?tableId=X   - Get orders for table
POST   /api/ai                  - Semantic search & chat
POST   /api/vision              - Image/dish recognition
```

## 🧪 API Examples

### Create Order

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "tableId": "table-1",
    "tableNumber": 1,
    "items": [{
      "productId": "prod-1",
      "productName": "Pizza",
      "quantity": 2,
      "price": 12.99
    }],
    "totalAmount": 25.98,
    "subtotal": 25.98,
    "tax": 2.60
  }'
```

### Semantic Search (AI)

```bash
curl -X POST http://localhost:3000/api/ai \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I want vegetarian pasta",
    "tableId": "table-1"
  }'
```

### Vision Recognition

```bash
curl -X POST http://localhost:3000/api/vision \
  -F "file=@dish.jpg"
```

## 🎨 UI Components

All components are in `src/components/ui/`:

- **Button** - Primary, secondary, outline, ghost, link variants
- **Card** - Container with header, title, description, content, footer
- **Badge** - Status indicators with variants
- **Input** - Form input with validation styling
- **Table** - Data grid with header, body, footer, row, cell

Import examples:

```tsx
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
```

## 📦 State Management (Zustand)

### Order Store

```tsx
import { useOrderStore } from "@/store/use-order-store";

const { items, addItem, removeItem, getTotal } = useOrderStore();
```

### Table Store

```tsx
import { useTableStore } from "@/store/use-table-store";

const { tables, setTables, selectTable } = useTableStore();
```

### Auth Store

```tsx
import { useAuthStore } from "@/store/use-auth-store";

const { user, login, logout } = useAuthStore();
```

## 🎣 Custom Hooks

### useCart

```tsx
const { items, addToCart, removeFromCart, total } = useCart();
```

### useSpeech

```tsx
const { startListening, speak, transcript } = useSpeech();
```

### useAudioAnalyzer

```tsx
const { analyzeAudio, threshold } = useAudioAnalyzer();
```

## 🔌 Service Worker & PWA

The application includes full PWA support:

### Features

- ✅ **Offline Caching** - Static assets cached on first visit
- ✅ **Background Sync** - Orders sync when connection returns
- ✅ **Push Notifications** - Real-time order updates
- ✅ **Installable** - Add to home screen on mobile
- ✅ **Offline Fallback** - Beautiful offline page

### Testing Service Worker

```bash
# Build for production
npm run build

# Start production server
npm start

# Visit http://localhost:3000 and check DevTools > Application > Service Workers
```

## 📝 Form Validation

All forms use Zod schemas from `src/lib/validations/`:

```tsx
import { productSchema, createProductSchema } from "@/lib/validations/product";

// Validate data
const validated = createProductSchema.parse(formData);
```

Available schemas:

- `product.ts` - Product management
- `order.ts` - Order creation and updates
- `table.ts` - Table configuration
- `ai.ts` - Chat and semantic search
- `auth.ts` - Login and registration
- `cart.ts` - Shopping cart

## 🧑‍💻 Development Workflow

### Creating a New Component

```tsx
// src/components/shared/NewComponent.tsx
"use client";

import { Button } from "@/components/ui/button";

export function NewComponent() {
  return (
    <div>
      <Button>Click me</Button>
    </div>
  );
}
```

### Creating a New API Route

```typescript
// src/app/api/example/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  // Process request
  return NextResponse.json({ success: true });
}
```

### Adding MongoDB Model

```typescript
// src/lib/models/example.model.ts
import mongoose from "mongoose";

const schema = new mongoose.Schema({
  name: String,
  // ... fields
});

export const Example =
  mongoose.models.Example || mongoose.model("Example", schema);
```

## 🚨 Troubleshooting

### MongoDB Connection Issues

- Ensure MongoDB is running: `mongod`
- Check `MONGODB_URI` in `.env.local`
- Verify network access (if using Atlas)

### Service Worker Not Working

- Clear browser cache (DevTools > Application > Clear storage)
- Rebuild project: `npm run build`
- Check console for SW registration errors

### Components Not Rendering

- Ensure `'use client'` directive for client components
- Check TailwindCSS is loaded in globals.css
- Verify component imports use `@/` paths

## 📦 Build & Deployment

### Build for Production

```bash
npm run build
npm start
```

### Build Size

The project uses:

- Code splitting for routes
- Incremental Static Regeneration (ISR)
- Image optimization via Next.js

### Deployment Options

- Vercel (recommended for Next.js)
- Docker/Kubernetes
- Traditional Node.js hosting

Example Vercel deployment:

```bash
npm install -g vercel
vercel --env-file .env.local
```

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Mongoose Docs](https://mongoosejs.com/)
- [Zod Validation](https://zod.dev/)
- [Zustand](https://github.com/pmndrs/zustand)
- [Shadcn UI](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

## 📄 License

This project is part of a Final Year Project (FYP). All rights reserved.

## 👥 Support

For issues or questions, refer to:

- Project documentation in `docs/`
- API examples in `examples/`
- Issue tracker on GitHub
