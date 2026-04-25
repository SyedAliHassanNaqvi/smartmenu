# SmartMenu Integration Guide

## Quick Start

### 1. Clone & Setup

```bash
git clone <your-repo>
cd smartmenu
npm install
cp .env.example .env.local
```

### 2. Configure Environment Variables

Edit `.env.local` with your API keys:

```env
# AI
NEXT_PUBLIC_AI_PROVIDER=gemini
GEMINI_API_KEY=your_key_from_aistudio.google.com
OPENAI_API_KEY=sk_... (optional, for fallback)

# Database
MONGODB_URI=mongodb+srv://...
DB_NAME=smartmenu

# Features
NEXT_PUBLIC_AR_ENABLED=true
NEXT_PUBLIC_VISION_ENABLED=true
NEXT_PUBLIC_GAMIFICATION_ENABLED=true
```

### 3. Start Development

```bash
npm run dev
# Open http://localhost:3000
```

---

## API Integration Steps

### Step 1: Get Gemini API Key

1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy key to `.env.local`

### Step 2: Setup MongoDB Atlas Vector Search

1. Create MongoDB cluster: https://cloud.mongodb.com
2. Enable Vector Search on your cluster
3. Copy connection string to `MONGODB_URI`
4. Create database: `smartmenu`

### Step 3: (Optional) Setup OpenAI for Embeddings

1. Go to https://platform.openai.com/api-keys
2. Create API key
3. Copy to `OPENAI_API_KEY`

### Step 4: (Optional) Setup Pusher for Real-time

1. Create account at https://pusher.com
2. Copy credentials to `.env.local`
3. Set `NEXT_PUBLIC_USE_PUSHER=true`

---

## Feature Testing

### Test AR Mascot

```
1. Go to http://localhost:3000/customer/table-1/ar-view
2. Click "Mascot" tab
3. Click "Enable Audio Analysis"
4. Click "Make Mascot Speak"
→ Mascot should respond with adaptive volume
```

### Test Vision Recognition

```
1. Go to AR View → Vision tab
2. Click "Start Camera"
3. Take photo of a dish
→ Should identify dish, show nutrition info
```

### Test Gamified Loyalty

```
1. Go to AR View → Catch tab
2. Tap ingredients for 30 seconds
3. Try to get score for discount
→ Should unlock discount code
```

### Test Admin Dashboard

```
1. Go to http://localhost:3000/admin/dashboard
2. See analytics cards and table map
→ Should show mock data
```

### Test Semantic Search

```
1. Use voice to ask: "Show me something light"
2. Should return recommendations from Virtual Sommelier
```

---

## Database Seeding (Optional)

Create seed data script:

```bash
# Create scripts/seed.ts
npx ts-node scripts/seed.ts
```

This will populate:

- 20 sample products with embeddings
- 6 tables
- 10 sample orders

---

## Deployment

### Vercel Deployment

```bash
vercel
# Follow prompts to deploy
```

### Environment Variables on Vercel

1. Go to Project Settings → Environment Variables
2. Add all variables from `.env.local`
3. Redeploy

### Docker Deployment

```bash
docker build -t smartmenu .
docker run -p 3000:3000 --env-file .env.local smartmenu
```

---

## Troubleshooting

### "Cannot find module '@/...'"

- Check `tsconfig.json` paths
- Ensure `@/*` points to `./src/*`

### "Gemini API key not found"

- Verify `.env.local` has `GEMINI_API_KEY`
- Restart dev server after updating env

### "MongoDB connection failed"

- Check connection string in `.env.local`
- Verify IP whitelist in MongoDB Atlas
- Check database exists

### "Vision endpoint returning 500"

- Check Gemini API key is valid
- Verify image file type is supported
- Check file size < 20MB

### "Real-time updates not working"

- Check WebSocket URL is accessible
- Verify Pusher credentials if enabled
- Check browser console for connection errors

---

## Performance Optimization

### Images

- Use Next.js Image component
- Enable AVIF format
- Optimize for mobile

### AR Models

- Use compressed GLB files
- Load on-demand
- Cache models in Service Worker

### API Calls

- Implement request debouncing
- Add caching headers
- Use pagination for large datasets

### Database

- Add indexes for common queries
- Use vector search limits
- Monitor query performance

---

## Security Checklist

- [ ] API keys in `.env.local` (not committed)
- [ ] HTTPS enabled in production
- [ ] CORS configured properly
- [ ] Rate limiting on API routes
- [ ] Input validation on all forms
- [ ] JWT tokens for admin routes
- [ ] Database authentication enabled

---

## Next Steps

1. **Setup completed?** → Go to [DETAILED_SPECIFICATION.md](./DETAILED_SPECIFICATION.md)
2. **Features working?** → Deploy to Vercel/Docker
3. **Need to customize?** → Modify `/src/components` and API routes
4. **Production ready?** → See [Deployment](#deployment) section

---

## Support Resources

- [Next.js Docs](https://nextjs.org/docs)
- [MongoDB Docs](https://docs.mongodb.com)
- [Gemini API Docs](https://ai.google.dev/)
- [Zod Docs](https://zod.dev)
- [Tailwind Docs](https://tailwindcss.com/docs)
- [A-Frame Docs](https://aframe.io/docs)

---

**Last Updated:** April 24, 2026
**Version:** 1.0.0-beta
