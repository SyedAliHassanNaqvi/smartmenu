# 🗺️ SmartMenu - Complete Implementation Roadmap

**Last Updated:** April 25, 2026  
**Status:** Work in Progress - Completion target: 100%

---

## 📌 Quick Navigation

- **Phase 1-3:** Foundation & Database Setup (✅ ~30% Complete)
- **Phase 4-6:** Core API & Business Logic (✅ ~40% Complete)
- **Phase 7-9:** Authentication & QR System (⏳ NOT STARTED)
- **Phase 10-12:** File Upload & Media Management (⏳ NOT STARTED)
- **Phase 13-15:** Real-time Features & WebSockets (✅ ~20% Complete)
- **Phase 16-18:** Testing, Optimization & Deployment (⏳ NOT STARTED)

**Overall Progress: ~35% Complete** | Estimated Remaining: 2-3 weeks of work

---

## 🎓 Learning Resources First

Before diving into implementation, understand these complex concepts:

### WebSockets & Real-time Communication

**Status:** Needed for admin dashboard and table map updates

**Learn here:**

- [MDN WebSocket Documentation](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- Concept: Two-way communication channel between client and server
- In SmartMenu: Used for live table occupancy updates, order status

**Code Resource in Your Project:**

- Check: `src/lib/websocket.ts` (already scaffolded)
- Used in: `src/components/admin/AdminTableMap.tsx`

**Simple Explanation:**

```
Regular HTTP:   Client asks → Server answers → Connection closes
WebSocket:      Client & Server have open pipeline → Data flows both ways instantly
```

**SmartMenu Use Case:**

- Admin opens dashboard
- Table occupancy changes at table-5
- Instead of admin manually refreshing, WebSocket pushes update instantly

---

### AR/Augmented Reality Concepts

**Status:** Core feature, needs completion

**Learn here:**

- [A-Frame Documentation](https://aframe.io/docs/) (Beginner-friendly 3D web)
- [WebAR vs WebGL differences](https://github.com/immersive-web/webxr/wiki)

**What is AR in SmartMenu:**

- **A-Frame:** Easy 3D scene builder (not full WebXR, but good for 90% of use cases)
- **Purpose:** Display 3D menu items or a mascot character
- **Not requiring:** VR headsets, special glasses

**Your Implementation:**

- `ARMascot.tsx` - 3D character that reacts to voice
- Load GLB models (3D files)
- Overlay on camera view

**Simple Start:**

```html
<!-- A-Frame scene - very simple -->
<a-scene>
  <a-box position="0 0 -5" rotation="0 45 0" color="#4CC3D9"></a-box>
  <a-camera position="0 0 0"></a-camera>
</a-scene>
```

---

### Vector Embeddings & Semantic Search

**Status:** Partially implemented, needs MongoDB setup

**Learn here:**

- [OpenAI Embeddings Explained](https://openai.com/blog/new-and-improved-embedding-model)
- [MongoDB Vector Search](https://www.mongodb.com/docs/atlas/atlas-search/vector-search/overview/)

**Simple Concept:**

```
Text: "light vegetarian salad"
    ↓
Convert to 768 numbers: [0.234, -0.123, 0.456, ...]
    ↓
Store in database
    ↓
User asks: "healthy option"
    ↓
Convert user query to same 768 numbers
    ↓
Database finds closest match using math
    ↓
Returns: "light vegetarian salad"
```

**Your Project Setup:**

- `src/services/vector-service.ts` (exists but incomplete)
- Needs: OpenAI API or Gemini embeddings
- Database: MongoDB with vector index

---

### QR Code Generation & Scanning

**Status:** NOT IMPLEMENTED - Critical for customer access

**Learn here:**

- [QR Code Standards](https://www.qr-code-generator.com/qr-code-marketing/qr-codes-basics/)

**Simple Concept:**

- Backend generates unique QR for each table (contains table ID)
- Customer scans with phone → Redirects to `/customer/table-5/menu`
- No login needed - table ID is in URL

---

## 📊 Detailed Phase-by-Phase Roadmap

---

# PHASE 1: Authentication & QR System

**Timeline:** Week 1 (Days 1-3)  
**Priority:** 🔴 CRITICAL - Blocks everything else

### 1.1 Setup QR Code Generation

**What:** Generate QR codes for each table  
**Why:** Customers need to scan QR to access their table's menu

**Steps:**

1. Install QR library:

   ```bash
   npm install qrcode.react zustand-persist
   ```

2. Create QR generation service:

   ```typescript
   // src/services/qr-service.ts
   import QRCode from "qrcode";

   export async function generateTableQR(tableId: string): Promise<string> {
     const url = `${process.env.NEXT_PUBLIC_APP_URL}/customer/${tableId}`;
     return await QRCode.toDataURL(url);
   }
   ```

3. Create admin page to generate/print QRs:
   ```typescript
   // src/app/(admin)/qr-codes/page.tsx
   // Shows all table QRs
   // Allows printing in batch
   ```

**Learning Resource:**

- [QRCode.react Docs](https://github.com/davidrevival/qrcode.react)

**Acceptance Criteria:**

- ✅ Can generate QR for each table
- ✅ QR contains table ID
- ✅ Admin can print all QRs at once
- ✅ Customer scanning QR lands on correct table menu

---

### 1.2 Implement Table Access Route

**What:** Create `/customer/[tableId]` route that validates table exists

**Steps:**

1. Update layout to extract tableId from URL
2. Validate table exists in database
3. Store tableId in Zustand store
4. Prevent direct URL access if table invalid

```typescript
// src/app/(customer)/[tableId]/layout.tsx
import { useParams } from 'next/navigation';
import { useTableStore } from '@/store/use-table-store';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const tableId = params.tableId as string;

  // TODO: Validate table exists via API
  useTableStore().setCurrentTable(tableId);

  return <>{children}</>;
}
```

**Acceptance Criteria:**

- ✅ Invalid table ID shows error page
- ✅ Valid table ID loads customer menu
- ✅ Table ID persisted in session

---

### 1.3 Add Admin Login (Optional but Recommended)

**What:** Protect `/admin` routes from public access

**Steps:**

1. Create simple password login (for MVP)
2. Store in localStorage
3. Check on admin routes

```typescript
// src/lib/auth.ts
export function isAdminLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("admin_token");
}

// src/app/(admin)/layout.tsx - Add check
if (!isAdminLoggedIn()) {
  redirect("/admin/login");
}
```

**Future:** Replace with proper auth (OAuth, Firebase, etc.)

**Acceptance Criteria:**

- ✅ Cannot access `/admin` without login
- ✅ Logout clears session
- ✅ Works on refresh

---

# PHASE 2: File Upload System

**Timeline:** Week 1 (Days 4-5)  
**Priority:** 🟠 HIGH - Needed for product management

### 2.1 Setup Image Upload Infrastructure

**What:** Allow admins to upload product images

**Install:**

```bash
npm install sharp next-cloudinary
# or: npm install sharp multer (for self-hosted)
```

**Option A: Cloud Storage (Recommended - Easier)**

1. Sign up for Cloudinary (free tier: 25GB/month)
2. Get Cloud Name, API Key, API Secret
3. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

**Option B: Local Storage (Self-hosted)**

1. Create `public/uploads` directory
2. Use multer to handle uploads
3. Store path in MongoDB

**Recommended:** Start with Cloudinary (no backend complexity)

---

### 2.2 Create Admin Upload Interface

**What:** Page where admin uploads product images

**Create file:** `src/app/(admin)/products/upload/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { CldUploadWidget } from 'next-cloudinary';

export default function ProductUploadPage() {
  const [imageUrl, setImageUrl] = useState<string>('');

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Upload Product Image</h1>

      <CldUploadWidget
        uploadPreset="smartmenu_products"
        onSuccess={(result: any) => {
          setImageUrl(result.info.secure_url);
        }}
      >
        {({ open }) => (
          <button
            onClick={() => open()}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Upload Image
          </button>
        )}
      </CldUploadWidget>

      {imageUrl && (
        <div className="mt-4">
          <img src={imageUrl} alt="Uploaded" className="max-w-md" />
          <p className="text-gray-600">URL: {imageUrl}</p>
        </div>
      )}
    </div>
  );
}
```

**Learning Resource:**

- [Cloudinary Upload Widget Docs](https://cloudinary.com/documentation/upload_widget)

**Acceptance Criteria:**

- ✅ Admin can select image file
- ✅ Image uploaded to cloud
- ✅ URL returned and displayed
- ✅ Can save URL to product in database

---

### 2.3 Integrate Uploads with Product Management

**What:** Link image uploads to product creation/editing

**Steps:**

1. Update product form to include image upload
2. Save image URL with product document
3. Display product images on menu

```typescript
// In your product form component
const [imageUrl, setImageUrl] = useState<string>("");
const [productName, setProductName] = useState<string>("");

async function handleSaveProduct() {
  const response = await fetch("/api/products", {
    method: "POST",
    body: JSON.stringify({
      name: productName,
      imageUrl: imageUrl,
      // ... other fields
    }),
  });
}
```

**Acceptance Criteria:**

- ✅ Product schema includes imageUrl field
- ✅ Admin form has upload field
- ✅ Images display on customer menu
- ✅ Images are optimized (compressed)

---

# PHASE 3: Core API Completion

**Timeline:** Week 2 (Days 1-3)  
**Priority:** 🟠 HIGH

### 3.1 Complete `/api/products` Endpoint

**What:** CRUD operations for menu products

**Current Status:** ❌ Not implemented

**Create:** `src/app/api/products/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/lib/models/product.model";
import { productSchema } from "@/lib/validations/product";

// GET all products
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const products = await Product.find({});
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

// POST create product
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    // Validate with Zod
    const validated = productSchema.parse(body);

    // TODO: Generate embeddings for semantic search
    const product = await Product.create(validated);

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 400 },
    );
  }
}
```

**Also Create:**

- `src/app/api/products/[id]/route.ts` - PUT, DELETE operations
- `src/app/api/products/search/route.ts` - Semantic search

**Acceptance Criteria:**

- ✅ GET returns all products
- ✅ POST creates new product with validation
- ✅ PUT updates existing product
- ✅ DELETE removes product

---

### 3.2 Complete `/api/tables` Endpoint

**What:** Manage table information (occupancy, status)

**Create:** `src/app/api/tables/route.ts`

```typescript
// GET all tables with occupancy
// PUT update table (occupancy, status, notes)
// POST create new table
```

**Real-time Integration:**

- When order placed → Update table occupancy
- When checkout → Clear table
- When customer sits → Set to occupied

---

### 3.3 Complete `/api/orders` Endpoint

**What:** Full order lifecycle management

**Endpoints Needed:**

```
GET    /api/orders              - List all orders
GET    /api/orders/[id]         - Get specific order
POST   /api/orders              - Create new order
PUT    /api/orders/[id]         - Update order status
DELETE /api/orders/[id]         - Cancel order
GET    /api/orders?tableId=5    - Get orders for table
GET    /api/orders/stats        - Analytics (total, today, etc.)
```

**Key Logic:**

```typescript
// When order created:
1. Validate items exist and prices match
2. Apply discount if game was played
3. Create order document
4. Update table occupancy
5. Broadcast update to admin via WebSocket
6. Return order confirmation

// When order completed:
1. Update order status to "completed"
2. Clear table occupancy
3. Broadcast update to admin
```

**Acceptance Criteria:**

- ✅ All CRUD operations work
- ✅ Validation prevents invalid orders
- ✅ Discount is applied correctly
- ✅ Table status updates

---

# PHASE 4: Semantic Search & AI Integration

**Timeline:** Week 2 (Days 4-5)  
**Priority:** 🟡 MEDIUM - Advanced feature

### 4.1 Setup Vector Embeddings

**What:** Convert product descriptions to 768-dimensional vectors

**Current Status:** ⚠️ Partially implemented

**Setup OpenAI Embeddings:**

```bash
npm install openai
```

**Create:** `src/services/embeddings-service.ts`

```typescript
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });

  return response.data[0].embedding;
}

// Generate embeddings for all product descriptions
export async function seedProductEmbeddings() {
  const products = await Product.find({});

  for (const product of products) {
    const embedding = await generateEmbedding(product.description);
    product.embeddings = embedding;
    await product.save();
  }
}
```

**Cost:** ~$0.02 per 1M tokens = VERY cheap

**Acceptance Criteria:**

- ✅ Products have 768-dim embeddings
- ✅ Embeddings generated on product creation
- ✅ Stored in MongoDB

---

### 4.2 Setup MongoDB Vector Search

**What:** Create index for similarity search

**In MongoDB Atlas Dashboard:**

1. Go to your database
2. Collections → smartmenu_db → products
3. Search Indexes → Create Search Index
4. JSON Editor → Paste:

```json
{
  "mappings": {
    "dynamicMappings": true,
    "fields": {
      "embeddings": {
        "dimensions": 768,
        "similarity": "cosine",
        "type": "knnVector"
      }
    }
  }
}
```

**Acceptance Criteria:**

- ✅ Vector search index created
- ✅ Vector search query returns results

---

### 4.3 Implement Semantic Search API

**What:** Find products by meaning, not just keywords

**Create:** `src/app/api/search/semantic/route.ts`

```typescript
export async function POST(request: NextRequest) {
  const { query } = await request.json();

  // 1. Generate embedding for user query
  const queryEmbedding = await generateEmbedding(query);

  // 2. Search MongoDB vector index
  const results = await Product.aggregate([
    {
      $search: {
        cosmosSearch: {
          vector: queryEmbedding,
          k: 10, // Return top 10 results
        },
        returnScore: true,
        scoreDetails: "vector",
      },
    },
  ]);

  return NextResponse.json(results);
}
```

**Test It:**

```bash
curl -X POST http://localhost:3000/api/search/semantic \
  -H "Content-Type: application/json" \
  -d '{"query": "light vegetarian option"}'
```

**Acceptance Criteria:**

- ✅ Semantic search returns relevant products
- ✅ Results ranked by similarity
- ✅ Works with natural language queries

---

# PHASE 5: Real-time Features & WebSockets

**Timeline:** Week 3 (Days 1-2)  
**Priority:** 🟠 HIGH - Critical for admin features

### 5.1 Understanding WebSockets

**Concept:**

```
Traditional HTTP (Request-Response):
Client: "Give me table data"
Server: Sends data
Client: "Give me table data again" (manual refresh)
Server: Sends data

WebSocket (Persistent Connection):
Client → Server: [Connected]
Server: "Table 5 now occupied"
Server: "New order at table 3"
Client receives instantly without asking
```

**In SmartMenu:**

- Admin dashboard needs live updates
- When table status changes → Admin sees it instantly
- When new order placed → Admin notified instantly

---

### 5.2 Setup Pusher (Easier Alternative to Raw WebSockets)

**Why Pusher?** Handles all the complexity; gives you WebSocket-like behavior

**Setup:**

1. Sign up at [pusher.com](https://pusher.com) (free tier available)
2. Create new app
3. Copy credentials
4. Add to `.env.local`:

   ```env
   NEXT_PUBLIC_PUSHER_KEY=xxxxx
   NEXT_PUBLIC_PUSHER_CLUSTER=xxxxx
   PUSHER_SECRET=xxxxx
   ```

5. Install client:
   ```bash
   npm install pusher-js
   ```

**Already in your package.json:** `"pusher": "^5.3.3"` and `"pusher-js": "^8.5.0"`

---

### 5.3 Implement Real-time Table Updates

**What:** When table occupancy changes, all admin dashboards update instantly

**Backend - Broadcast table status:**

```typescript
// src/app/api/tables/[id]/route.ts
import Pusher from "pusher";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const { occupancy, status } = await request.json();
  const table = await Table.findByIdAndUpdate(params.id, { occupancy, status });

  // Broadcast update to all admins
  await pusher.trigger("table-updates", "table-changed", {
    tableId: params.id,
    occupancy,
    status,
    timestamp: new Date(),
  });

  return NextResponse.json(table);
}
```

**Frontend - Receive updates:**

```typescript
// src/components/admin/AdminTableMap.tsx
'use client';

import { useEffect, useState } from 'react';
import PusherJS from 'pusher-js';

export default function AdminTableMap() {
  const [tables, setTables] = useState<any[]>([]);

  useEffect(() => {
    // Initialize Pusher
    const pusher = new PusherJS(
      process.env.NEXT_PUBLIC_PUSHER_KEY,
      {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      }
    );

    // Subscribe to channel
    const channel = pusher.subscribe('table-updates');

    // Listen for updates
    channel.bind('table-changed', (data: any) => {
      setTables(prev =>
        prev.map(t =>
          t._id === data.tableId
            ? { ...t, occupancy: data.occupancy, status: data.status }
            : t
        )
      );
    });

    // Cleanup
    return () => {
      pusher.unsubscribe('table-updates');
    };
  }, []);

  return (
    <div className="grid grid-cols-4 gap-4">
      {tables.map(table => (
        <div
          key={table._id}
          className={`p-4 rounded ${
            table.occupancy > 0 ? 'bg-red-200' : 'bg-green-200'
          }`}
        >
          <h3>Table {table.number}</h3>
          <p>{table.occupancy} customers</p>
        </div>
      ))}
    </div>
  );
}
```

**Acceptance Criteria:**

- ✅ Admin dashboard loads table data on mount
- ✅ When table status changes in database, dashboard updates in real-time
- ✅ No page refresh needed
- ✅ Multiple admins see updates simultaneously

---

# PHASE 6: AI Features - Vision & Mascot

**Timeline:** Week 3 (Days 3-4)  
**Priority:** 🟡 MEDIUM - Differentiator feature

### 6.1 Setup Vision API (Gemini)

**What:** Identify dishes from camera photos

**Already in env:** `GEMINI_API_KEY`

**Create:** `src/services/vision-service.ts`

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function identifyDish(imageBuffer: Buffer): Promise<{
  dishName: string;
  confidence: number;
  ingredients: string[];
  calories: number;
  description: string;
}> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const image = {
    inlineData: {
      data: imageBuffer.toString("base64"),
      mimeType: "image/jpeg",
    },
  };

  const result = await model.generateContent([
    image,
    `Analyze this food image and respond with ONLY valid JSON (no markdown):
    {
      "dishName": "name of the dish",
      "confidence": 0.95,
      "ingredients": ["ingredient1", "ingredient2"],
      "calories": 250,
      "description": "brief description"
    }`,
  ]);

  const text = result.response.text();
  return JSON.parse(text);
}
```

**Install:**

```bash
npm install @google/generative-ai
```

---

### 6.2 Create Vision API Endpoint

**What:** Endpoint to receive camera image and identify dish

**Create:** `src/app/api/vision/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { identifyDish } from "@/services/vision-service";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("image") as File;

    if (!imageFile) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const dishInfo = await identifyDish(buffer);

    // Find matching products in database
    const matchingProducts = await Product.find({
      $text: { $search: dishInfo.dishName },
    });

    return NextResponse.json({
      ...dishInfo,
      matchingProducts,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to identify dish" },
      { status: 500 },
    );
  }
}
```

**Acceptance Criteria:**

- ✅ Receives image upload
- ✅ Sends to Gemini API
- ✅ Returns dish identification
- ✅ Finds matching products

---

### 6.3 AR Mascot - Adaptive Volume

**What:** 3D character responds to user with volume adapted to noise

**Update:** `src/components/customer/ARMascot.tsx`

**Key Features:**

```typescript
export default function ARMascot() {
  const { analyzeAudio, volumeLevel } = useAudioAnalyzer();
  const [mascotText, setMascotText] = useState('');

  useEffect(() => {
    // Start audio analysis
    const stream = navigator.mediaDevices.getUserMedia({ audio: true });
    analyzeAudio(stream);
  }, []);

  async function speak(text: string) {
    // Adaptive volume: quieter in quiet rooms, louder in noisy rooms
    const volumeFactor = Math.min(1, 0.5 + (volumeLevel / 100) * 0.5);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = volumeFactor;
    window.speechSynthesis.speak(utterance);
  }

  return (
    <div>
      <a-scene>
        <a-gltf-model src="/models/mascot.glb" />
        <a-camera position="0 0 0"></a-camera>
      </a-scene>
      <p>Ambient volume: {volumeLevel.toFixed(1)} dB</p>
      <button onClick={() => speak('Hi there! How can I help?')}>
        Make Mascot Speak
      </button>
    </div>
  );
}
```

**Get 3D Model:**

1. Download free GLB from [sketchfab.com](https://sketchfab.com)
2. Place in `public/models/mascot.glb`
3. Reference in A-Frame scene

**Acceptance Criteria:**

- ✅ 3D model loads
- ✅ Microphone permission requested
- ✅ Volume level displayed
- ✅ Speech volume adapts to noise

---

# PHASE 7: Loyalty Game

**Timeline:** Week 3 (Days 5)  
**Priority:** 🟡 MEDIUM

### 7.1 Implement Ingredient Catching Game

**What:** 30-second game where users tap to catch ingredients, earn discount

**Status:** ⚠️ Component exists but needs completion

**Update:** `src/components/customer/IngredientGame.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useOrderStore } from '@/store/use-order-store';

export default function IngredientGame() {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameActive, setGameActive] = useState(false);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const { addDiscount } = useOrderStore();

  // Spawn ingredients randomly
  useEffect(() => {
    if (!gameActive) return;

    const interval = setInterval(() => {
      setIngredients(prev => [...prev, {
        id: Math.random(),
        x: Math.random() * 80,
        y: Math.random() * 80,
      }]);
    }, 300);

    return () => clearInterval(interval);
  }, [gameActive]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      setGameActive(false);
      const discount = Math.floor(score / 10); // Score 100 = 10% discount
      addDiscount(discount);
      return;
    }

    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, gameActive]);

  function catchIngredient(id: number) {
    setScore(score + 10);
    setIngredients(prev => prev.filter(ing => ing.id !== id));
  }

  return (
    <div className="relative w-full h-96 bg-gray-100 overflow-hidden border-2 border-yellow-500">
      <div className="absolute top-4 right-4 text-2xl font-bold">
        Score: {score} | Time: {timeLeft}s
      </div>

      {!gameActive ? (
        <button
          onClick={() => setGameActive(true)}
          className="absolute inset-0 m-auto w-40 h-12 bg-green-500 text-white rounded"
        >
          Start Game
        </button>
      ) : (
        <>
          {ingredients.map(ing => (
            <button
              key={ing.id}
              onClick={() => catchIngredient(ing.id)}
              className="absolute w-8 h-8 bg-yellow-400 rounded-full"
              style={{
                left: `${ing.x}%`,
                top: `${ing.y}%`,
              }}
            />
          ))}
        </>
      )}
    </div>
  );
}
```

**Acceptance Criteria:**

- ✅ Game starts on button click
- ✅ Ingredients spawn and appear
- ✅ Tapping ingredient increases score
- ✅ 30-second timer counts down
- ✅ Discount applied at end (score/10 = %)

---

# PHASE 8: Checkout & Orders

**Timeline:** Week 4 (Days 1-2)  
**Priority:** 🔴 CRITICAL

### 8.1 Implement Checkout Flow

**Create:** `src/app/(customer)/[tableId]/checkout/page.tsx`

```typescript
'use client';

import { useOrderStore } from '@/store/use-order-store';
import { useState } from 'react';

export default function CheckoutPage() {
  const { items, discount, total } = useOrderStore();
  const [orderPlaced, setOrderPlaced] = useState(false);

  async function placeOrder() {
    const response = await fetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        items: items.map(i => ({ productId: i.id, quantity: i.qty })),
        discount,
        tableId: params.tableId, // Get from useParams()
        totalAmount: total,
      }),
    });

    if (response.ok) {
      setOrderPlaced(true);
      // Clear cart
      useOrderStore().clearCart();
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Order Summary</h1>

      {/* Items */}
      <div className="mb-6">
        {items.map(item => (
          <div key={item.id} className="flex justify-between mb-2">
            <span>{item.name}</span>
            <span>${item.price * item.qty}</span>
          </div>
        ))}
      </div>

      {/* Discount */}
      {discount > 0 && (
        <div className="text-green-600 text-lg font-bold mb-4">
          Discount: -{discount}%
        </div>
      )}

      {/* Total */}
      <div className="text-2xl font-bold mb-6">
        Total: ${(total * (1 - discount / 100)).toFixed(2)}
      </div>

      {orderPlaced ? (
        <div className="bg-green-100 p-4 rounded">
          ✅ Order placed successfully!
        </div>
      ) : (
        <button
          onClick={placeOrder}
          className="w-full bg-blue-500 text-white py-3 rounded"
        >
          Place Order
        </button>
      )}
    </div>
  );
}
```

**Acceptance Criteria:**

- ✅ Shows all items in cart
- ✅ Shows discount applied
- ✅ Shows total amount
- ✅ Place order button creates order
- ✅ Order saved to database

---

# PHASE 9: Admin Dashboard Completion

**Timeline:** Week 4 (Days 3-4)  
**Priority:** 🟠 HIGH

### 9.1 Complete Admin Analytics

**Update:** `src/components/admin/AdminAnalytics.tsx`

```typescript
export default function AdminAnalytics() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    arViews: 0,
    conversionRate: 0,
  });

  useEffect(() => {
    // Fetch stats from API
    fetch('/api/orders/stats')
      .then(r => r.json())
      .then(data => setStats(data));
  }, []);

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card title="Total Orders" value={stats.totalOrders} />
      <Card title="Revenue Today" value={`$${stats.totalRevenue}`} />
      <Card title="AR Views" value={stats.arViews} />
      <Card
        title="Conversion Rate"
        value={`${stats.conversionRate}%`}
        color="green"
      />
    </div>
  );
}
```

**API Endpoint Needed:**

```typescript
// GET /api/orders/stats
{
  totalOrders: 24,
  totalRevenue: 450.50,
  averageOrderValue: 18.77,
  arViews: 156,
  conversionRate: 15.4,
  peakHours: [12, 19, 20],
  popularItems: ["Margherita Pizza", "Caesar Salad"]
}
```

---

# PHASE 10: Testing & Quality Assurance

**Timeline:** Week 4 (Days 5) + Week 5  
**Priority:** 🔴 CRITICAL

### 10.1 Manual Testing Checklist

**Customer Flow:**

```
[ ] QR scan → Lands on table menu
[ ] Browse menu → Products display with images
[ ] Add to cart → Item appears in cart
[ ] Remove from cart → Item removed
[ ] Play game → Discount applied
[ ] Checkout → Order created
[ ] AI Mascot → Loads and responds
[ ] Vision → Camera opens and identifies food
```

**Admin Flow:**

```
[ ] Login → Dashboard accessible
[ ] View analytics → KPIs display
[ ] View table map → Tables show occupancy
[ ] Add product → Product created with image
[ ] Delete product → Product removed
[ ] Real-time update → Table status updates instantly
```

### 10.2 API Testing

**Use Postman or similar:**

```bash
# Test all endpoints
GET /api/products
POST /api/products (with image)
GET /api/products/[id]
PUT /api/products/[id]
DELETE /api/products/[id]

GET /api/orders
POST /api/orders
GET /api/orders/[id]

GET /api/tables
PUT /api/tables/[id]

POST /api/vision (with image)
POST /api/search/semantic
```

---

# PHASE 11: Performance Optimization

**Timeline:** Week 5 (Days 1-2)  
**Priority:** 🟡 MEDIUM

### 11.1 Image Optimization

- Use `next/image` for all images
- Enable lazy loading
- Set proper sizes attribute

### 11.2 Database Optimization

- Add indexes to frequently queried fields
- Use MongoDB projection to return only needed fields
- Implement pagination for lists

### 11.3 API Optimization

- Add response caching headers
- Implement request deduplication
- Use gzip compression

---

# PHASE 12: Deployment

**Timeline:** Week 5 (Days 3-5)  
**Priority:** 🔴 CRITICAL

### 12.1 Deploy to Vercel (Recommended)

```bash
npm i -g vercel
vercel
# Follow prompts
# Add environment variables in Vercel dashboard
```

### 12.2 Deploy Database

- MongoDB Atlas (already recommended)
- Create production cluster
- Add Vercel IP to whitelist

### 12.3 Setup CDN for Images

- Use Cloudinary (already integrated)
- Or: Vercel Image Optimization

---

## 📚 Learning Resources by Topic

### WebSockets & Real-time

- **Easy:** Pusher Channels (what we recommended)
- **Medium:** Socket.io with Node.js
- **Advanced:** Raw WebSocket API

**Tutorials:**

- [Pusher Getting Started](https://pusher.com/tutorials/node-realtime-apps)
- [MDN WebSocket Guide](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

### AR & 3D Graphics

- **Beginner:** A-Frame.io
- **Intermediate:** Three.js
- **Advanced:** Babylon.js or WebGL

**Start with A-Frame (what SmartMenu uses):**

- [A-Frame Official Tutorial](https://aframe.io/docs/)
- [A-Frame Examples](https://aframe.io/examples/)

### Vector Embeddings

- **Concept:** [Wikipedia - Word embeddings](https://en.wikipedia.org/wiki/Word_embedding)
- **Implementation:** [OpenAI Embeddings Docs](https://platform.openai.com/docs/guides/embeddings)
- **Database:** [MongoDB Vector Search](https://www.mongodb.com/docs/atlas/atlas-search/vector-search/overview/)

### File Uploads

- **Cloudinary:** [Upload Widget Docs](https://cloudinary.com/documentation/upload_widget)
- **AWS S3:** [S3 SDK for JavaScript](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/)

### Next.js App Router

- **Official:** [Next.js 16 Docs](https://nextjs.org/docs)
- **File Uploads:** [Next.js File Uploads](https://nextjs.org/docs/app/building-your-application/routing/route-handlers#streaming)

### Authentication

- **Simple (not for production):** localStorage + JWT
- **Production:** Firebase Auth or NextAuth.js
- **OAuth:** Google Sign-in, GitHub

---

## 🎯 Success Metrics

After completing each phase, verify:

- [ ] **Phase 1:** Can generate/scan QR codes
- [ ] **Phase 2:** Can upload product images
- [ ] **Phase 3:** All APIs work and return correct data
- [ ] **Phase 4:** Semantic search finds products by meaning
- [ ] **Phase 5:** Admin dashboard updates in real-time
- [ ] **Phase 6:** Vision API identifies dishes
- [ ] **Phase 7:** Loyalty game works and applies discount
- [ ] **Phase 8:** Can place complete orders
- [ ] **Phase 9:** Admin has full visibility
- [ ] **Phase 10:** All manual tests pass
- [ ] **Phase 11:** Page load < 2 seconds
- [ ] **Phase 12:** Deployed and accessible

---

## 🔄 Workflow: How to Use This Roadmap

### Every Morning:

1. Pick the next uncompleted phase
2. Read the phase description
3. Follow the implementation steps in order
4. Test after each step
5. Mark phase as ✅ when done

### When Stuck:

1. Check the "Learning Resources" section
2. Run the code examples
3. Test with curl or Postman
4. Check browser console for errors
5. Search MongoDB logs

### Weekly Sync:

1. Review completed phases
2. Identify blockers
3. Adjust timeline if needed
4. Update this document

---

## 💡 Pro Tips

1. **Start with QR codes (Phase 1)** - Everything else depends on this
2. **Test as you go** - Don't build 5 features then test
3. **Use Postman for APIs** - Much faster than frontend testing
4. **Commit frequently** - Make small commits for easy rollback
5. **Document as you go** - Future you will be grateful
6. **Use console.log liberally** - Remove later but super helpful now
7. **Start simple** - Add complexity only when basic works

---

**Last Updated:** April 25, 2026  
**Next Review:** After Phase 1 completion
