# SmartMenu - Detailed Specification Implementation Guide

## 🎯 Project Overview

This is a comprehensive AI-powered restaurant ordering system with WebAR capabilities, real-time order management, and gamified customer engagement.

### Key Features Implemented

✅ **AI AR Mascot** - A-Frame 3D model with adaptive volume based on ambient noise
✅ **Vision-Based Dish Recognition** - Gemini 1.5 Flash integration for image analysis
✅ **Semantic Search & Virtual Sommelier** - Vector embeddings with MongoDB Atlas
✅ **Gamified Loyalty** - "Catch the Ingredients" game with discount rewards
✅ **Real-time Table Map** - WebSocket-powered admin dashboard
✅ **Advanced Analytics** - Popular items vs AR views conversion tracking
✅ **PWA & Offline Support** - Service Worker with background sync
✅ **Audio Analysis** - RMS-based volume calculation for adaptive speech

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (admin)/
│   │   ├── dashboard/page.tsx      ← Analytics & Table Map
│   │   ├── menu/page.tsx
│   │   └── tables/page.tsx
│   ├── (customer)/
│   │   ├── [tableId]/page.tsx      ← Main ordering interface
│   │   └── ar-view/page.tsx        ← AR Mascot, Vision, Game
│   └── api/
│       ├── ai/route.ts             ← Semantic search, Virtual Sommelier
│       ├── vision/route.ts         ← Dish recognition
│       └── orders/route.ts         ← Order management
├── components/
│   ├── customer/
│   │   ├── ARMascot.tsx           ← AI Mascot with adaptive volume
│   │   ├── VisionLens.tsx         ← Camera-based dish recognition
│   │   └── IngredientGame.tsx     ← Gamified loyalty system
│   ├── admin/
│   │   ├── AdminTableMap.tsx      ← Real-time table status
│   │   └── AdminAnalytics.tsx     ← Order analytics & insights
│   └── ui/                        ← Shadcn components
├── hooks/
│   ├── use-audio-analyzer.ts      ← RMS volume calculation
│   ├── use-speech.ts              ← Text-to-speech, Speech-to-text
│   └── use-cart.ts                ← Cart management
├── lib/
│   ├── db.ts                      ← MongoDB connection
│   ├── ai-config.ts               ← LLM configuration
│   ├── websocket.ts               ← Real-time WebSocket
│   └── validations/
│       ├── enhanced-schemas.ts    ← Updated Zod schemas
│       └── ... (other schemas)
├── services/
│   ├── vector-service.ts          ← Semantic search & embeddings
│   ├── vision-service.ts          ← Gemini Vision integration
│   └── ... (other services)
├── store/                         ← Zustand state management
└── types/                         ← TypeScript interfaces
```

---

## 🚀 Feature Deep Dive

### 1. AI AR Mascot with Adaptive Volume

**Location:** `/src/components/customer/ARMascot.tsx`

**How It Works:**

1. Loads A-Frame 3D scene with GLB model
2. Accesses microphone via `navigator.mediaDevices.getUserMedia()`
3. Analyzes ambient noise using FFT (Fast Fourier Transform)
4. Calculates RMS (Root Mean Square) volume level
5. Adaptively scales `speechSynthesis.volume` based on noise

**Key Functions:**

```typescript
// Calculate RMS for volume
calculateRMS(data: Uint8Array): number
  → Returns volume in dB scale (-100 to 0)

// Get adaptive volume factor
getAdaptiveVolumeFactor(): number
  → Returns volume multiplier (0.5 to 1.0)
```

**Usage:**

```typescript
const { analyzeAudio } = useAudioAnalyzer();
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
const { getAdaptiveVolumeFactor } = await analyzeAudio(stream);
window.speechSynthesis.volume = getAdaptiveVolumeFactor();
```

---

### 2. Vision-Based Dish Recognition

**Location:** `/src/components/customer/VisionLens.tsx`

**Flow:**

1. User opens camera
2. Clicks "Recognize Dish" button
3. Captures video frame to canvas
4. Sends to `/api/vision` as image blob
5. Gemini 1.5 Flash identifies dish
6. Returns product ID, confidence, nutrition info, pairings

**API Endpoint:**

```
POST /api/vision
Content-Type: multipart/form-data

Response:
{
  "dishName": "Margherita Pizza",
  "productId": "prod-123",
  "confidence": 0.94,
  "ingredients": ["Tomato", "Mozzarella", "Basil"],
  "nutritionInfo": {
    "calories": 285,
    "protein": 12,
    "carbs": 36,
    "fat": 10
  },
  "recommendedPairings": ["Garlic Bread", "Iced Tea"],
  "price": 12.99,
  "matchedProducts": [...]
}
```

---

### 3. Semantic Search & Virtual Sommelier

**Location:** `/src/services/vector-service.ts`, `/src/lib/ai-config.ts`

**Architecture:**

```
User Query
    ↓
Generate Embeddings (OpenAI/Gemini)
    ↓
Vector Search (MongoDB Atlas)
    ↓
Retrieve Top N Products
    ↓
Virtual Sommelier Analysis
    ↓
LLM Recommendation (Gemini/GPT-4)
    ↓
Return Recommendation + Similar Products
```

**Database Schema (Enhanced Product):**

```typescript
{
  name: string,
  description: string,
  price: number,
  embeddings: number[],        // Vector embeddings
  tags: string[],              // e.g., ["light", "vegetarian"]
  pros: string[],              // e.g., ["low-calorie", "fresh"]
  cons: string[],              // e.g., ["contains nuts"]
  arModelUrl?: string,         // 3D model for AR
}
```

**API Endpoint:**

```
POST /api/ai
Content-Type: application/json

Request:
{
  "message": "I want something light for a hot day",
  "tableId": "table-1",
  "conversationId": "conv_123"
}

Response:
{
  "conversationId": "conv_123",
  "response": "I recommend the Light Quinoa Salad...",
  "recommendation": "Based on your request...",
  "selectedProduct": {...},
  "similarProducts": [...],
  "confidence": 0.92,
  "timestamp": "2026-04-24T..."
}
```

---

### 4. Gamified Loyalty System

**Location:** `/src/components/customer/IngredientGame.tsx`

**Game Mechanics:**

- 30-second countdown
- Tap to catch falling ingredients (emoji)
- 10 points per ingredient
- Discount = `(score / 10)%` (up to 100%)
- Auto-applies to order via Zustand store

**Order Schema Update:**

```typescript
{
  items: OrderItem[],
  gameScore: number,           // Score from ingredient game
  discount: number,            // Applied from game
  discountCode: string,        // e.g., "GAME5A7D9"
  status: "pending" | "paid" | "completed"
}
```

**Discount Logic:**

```typescript
const discountPercentage = Math.floor(score / 10);
applyDiscount(discountCode, discountPercentage);
// Updates useOrderStore with discount
```

---

### 5. Admin Real-Time Table Map

**Location:** `/src/components/admin/AdminTableMap.tsx`

**Features:**

- Grid layout of restaurant tables
- Status indicators: available, occupied, cleaning, maintenance
- Guest count + current order total
- Filter by status
- Real-time updates via WebSocket
- Occupancy statistics

**WebSocket Integration:**

```typescript
const ws = new WebSocket("wss://your-server.com/ws/tables");
ws.onmessage = (event) => {
  const updatedTable = JSON.parse(event.data);
  // Update table status in real-time
};
```

---

### 6. Advanced Analytics Dashboard

**Location:** `/src/components/admin/AdminAnalytics.tsx`

**Metrics Tracked:**

- Total Orders (by time period)
- Total AR Views (engagement metric)
- AR-to-Order Conversion Rate
- Popular Items (ordered count)
- Most AR-Viewed Items
- Peak Hours Analysis

**Data Points:**

```typescript
{
  name: "Margherita Pizza",
  ordered: 87,
  arViews: 156,
  conversionRate: 55.8,  // (ordered / arViews) * 100
}
```

---

## 🔌 API Integration Points

### Environment Variables

```env
# AI Configuration
NEXT_PUBLIC_AI_PROVIDER=gemini  # or "openai"
OPENAI_API_KEY=sk_...
GEMINI_API_KEY=...

# WebSocket (for real-time updates)
NEXT_PUBLIC_USE_PUSHER=false   # Set to true in production
PUSHER_KEY=...

# Database
MONGODB_URI=mongodb+srv://...
DB_NAME=smartmenu

# Vector Search (MongoDB Atlas)
VECTOR_SEARCH_ENABLED=true
```

### Third-Party Services to Integrate

1. **Gemini 1.5 Flash** (Vision + Reasoning)
   - Image analysis for dish recognition
   - LLM-powered recommendations

2. **OpenAI Embeddings** (Optional)
   - Generate vector embeddings for semantic search
   - Alternative: Use Gemini embeddings

3. **MongoDB Atlas** (Vector Search)
   - Store product embeddings
   - Perform $search aggregation

4. **Pusher** (Optional, for production)
   - Real-time WebSocket for table updates
   - Push notifications

---

## 📊 Database Schemas (Zod)

### Enhanced Product Schema

```typescript
{
  name: string,
  description: string,
  price: number,
  category: "appetizer" | "main" | "dessert" | "beverage" | "special",
  embeddings: number[],      // Vector for semantic search
  tags: string[],
  pros: string[],            // Sommelier uses this
  cons: string[],            // Sommelier uses this
  arModelUrl: string,        // A-Frame model
  isAvailable: boolean,
}
```

### Enhanced Order Schema

```typescript
{
  tableId: string,
  tableNumber: number,
  items: [
    {
      productId: string,
      productName: string,
      quantity: number,
      price: number,
    }
  ],
  gameScore: number,         // From ingredient game
  discount: number,          // Applied discount
  discountCode: string,      // Game reward code
  paymentStatus: "pending" | "paid" | "failed",
  status: "pending" | "completed",
}
```

### Enhanced Table Schema

```typescript
{
  tableNumber: number,
  capacity: number,
  status: "available" | "occupied" | "cleaning" | "maintenance",
  currentGuests: number,
  activeOrderId: string,
  lastUpdated: Date,
}
```

---

## 🎮 User Journeys

### Customer Journey (QR Code Entry)

```
1. Scan QR Code at Table
   ↓
2. Enter via /customer/[tableId]
   ↓
3. Browse Menu (with semantic search)
   ↓
4. Optional: Use Vision Lens (📸) to identify dishes
   ↓
5. Optional: Chat with Virtual Sommelier
   ↓
6. Optional: Play Ingredient Game (🎮) for discount
   ↓
7. Add items to cart
   ↓
8. Checkout
   ↓
9. Enjoy AR Mascot experience in /ar-view
```

### Admin Journey (Dashboard)

```
1. Login to /admin/dashboard
   ↓
2. View Analytics (Popular Items, AR Views, Conversion Rate)
   ↓
3. Monitor Table Map (Real-time occupancy)
   ↓
4. See Peak Hours Analysis
   ↓
5. Manage Menu (/admin/menu)
   ↓
6. Manage Tables (/admin/tables)
```

---

## 🔧 Development Setup

### 1. Install Dependencies

```bash
npm install
npm install axios aframe mind-ar pusher pusher-js recharts
```

### 2. Configure Environment

```bash
cp .env.example .env.local
# Edit with your API keys
```

### 3. Start Development Server

```bash
npm run dev
# Visit http://localhost:3000
```

### 4. Test Features

- **AR Mascot:** `/customer/[tableId]/ar-view` → Mascot tab
- **Vision Lens:** `/customer/[tableId]/ar-view` → Vision tab
- **Ingredient Game:** `/customer/[tableId]/ar-view` → Catch tab
- **Admin Dashboard:** `/admin/dashboard`
- **Table Map:** `/admin/dashboard` (scroll down)

---

## 🚀 Production Deployment

### Backend Integration Checklist

- [ ] Connect Gemini 1.5 Flash API for vision
- [ ] Setup MongoDB Atlas with vector search
- [ ] Generate OpenAI/Gemini embeddings for products
- [ ] Configure Pusher for real-time updates
- [ ] Setup WebSocket server
- [ ] Configure CORS for APIs
- [ ] Setup CDN for GLB models
- [ ] Enable HTTPS for all endpoints

### Frontend Optimization

- [ ] Code splitting for AR libraries
- [ ] Image optimization
- [ ] Service Worker caching strategy
- [ ] Performance monitoring
- [ ] Analytics tracking

---

## 📚 Key Technologies

| Technology   | Purpose          | Version   |
| ------------ | ---------------- | --------- |
| Next.js      | Framework        | 16.2.4    |
| React        | UI Library       | 19.2.4    |
| Tailwind CSS | Styling          | 4         |
| Shadcn UI    | Components       | Latest    |
| Zod          | Validation       | 4.3.6     |
| Zustand      | State Management | Latest    |
| MongoDB      | Database         | Cloud     |
| A-Frame      | 3D/WebAR         | 1.4.2     |
| Mind-AR      | AR Tracking      | Latest    |
| Pusher       | Real-time        | Latest    |
| Gemini       | AI/Vision        | 1.5 Flash |
| OpenAI       | Embeddings       | GPT-4     |

---

## 🐛 Troubleshooting

### Vision Lens Not Working

- Check camera permissions in browser
- Verify file is image format
- Check Gemini API key in environment

### Mascot Volume Not Adapting

- Ensure microphone permission granted
- Check audio context initialization
- Verify browser supports Web Audio API

### Real-time Updates Not Working

- Check WebSocket connection
- Verify Pusher credentials
- Check browser console for errors

### Semantic Search Not Finding Products

- Ensure embeddings are generated
- Verify MongoDB Atlas Vector Search enabled
- Check query is being embedded

---

## 📞 Support

For issues or questions:

1. Check error messages in browser console
2. Verify all environment variables are set
3. Review API response format
4. Check MongoDB connection
5. Verify service status (Gemini, Pusher, etc.)

---

## 📄 License

This project is part of a Final Year Project (FYP). All rights reserved.

Last Updated: April 24, 2026
