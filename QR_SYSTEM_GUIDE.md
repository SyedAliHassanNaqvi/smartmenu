# QR Code Generation System - Quick Guide

## Overview

The QR code generation system allows admins to generate QR codes for each table. Customers can scan these QR codes to instantly access their table's menu without needing to log in or enter any credentials.

## How It Works

### For Admins:

1. Navigate to `/admin/qr-codes`
2. View all tables
3. Click "Generate QR" for individual tables or "Generate All QRs" for batch generation
4. Download individual QR codes or print all at once
5. Place printed QR codes on tables

### For Customers:

1. Scan QR code with phone camera
2. Automatically redirected to `/customer/[tableId]` menu
3. Browse menu, add items, play games, place orders

## Key Files

### Service Layer

- `src/services/qr-service.ts` - QR generation logic
  - `generateTableQR()` - Generate as Data URL
  - `generateTableQRBuffer()` - Generate as Buffer
  - `isValidTableId()` - Validate table IDs

### API Endpoints

- `src/app/api/qr/generate/route.ts` - QR generation endpoints
  - `POST /api/qr/generate` - Generate QR with body
  - `GET /api/qr/generate?tableId=table-1` - Generate QR with query params

- `src/app/api/tables/route.ts` - Table management
  - `GET /api/tables` - Fetch all tables
  - `POST /api/tables` - Create new table

### Admin UI

- `src/app/(admin)/qr-codes/page.tsx` - QR management dashboard

## Usage Examples

### Generate QR via API

```bash
# Using POST
curl -X POST http://localhost:3000/api/qr/generate \
  -H "Content-Type: application/json" \
  -d '{"tableId": "table-1"}'

# Using GET
curl http://localhost:3000/api/qr/generate?tableId=table-1
```

### Response

```json
{
  "success": true,
  "tableId": "table-1",
  "qrCode": "data:image/png;base64,...",
  "url": "http://localhost:3000/customer/table-1",
  "generatedAt": "2026-04-27T10:30:00.000Z"
}
```

## Configuration

### Environment Variables

Add to `.env.local`:

```env
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

The `NEXT_PUBLIC_APP_URL` is used to construct the QR code URL. In production, use your deployment URL.

## Features

✅ **Single QR Generation** - Generate QR for one table
✅ **Batch QR Generation** - Generate for all tables at once
✅ **Download Individual QRs** - PNG download for each table
✅ **Print All QRs** - Print all QRs at once in proper grid layout
✅ **QR Regeneration** - Regenerate if needed
✅ **High Error Correction** - QR codes work even if partially damaged
✅ **Responsive UI** - Works on desktop and tablet

## Testing

### Test in Admin Dashboard

1. Run `npm run dev`
2. Visit `http://localhost:3000/admin/qr-codes`
3. Click "Generate All QRs"
4. Try downloading or printing

### Test QR Code

1. Use a QR code scanner app
2. Scan generated QR code
3. Should redirect to `http://localhost:3000/customer/[tableId]`

## Acceptance Criteria

- ✅ Can generate QR for each table
- ✅ QR contains table ID in URL
- ✅ Admin can print all QRs at once
- ✅ Customer scanning QR lands on correct table menu
- ✅ QR codes have high error correction (works even if partially damaged)
- ✅ Responsive design works on mobile/tablet

## Next Steps

1. **Create Tables Model** - Link to MongoDB when ready
2. **Customer Route Validation** - Add check in `/customer/[tableId]/layout.tsx`
3. **QR Placement** - Print and place QRs on physical tables
4. **Testing** - Test scanning with real devices
5. **Analytics** - Track QR scans and redemptions

## Troubleshooting

### QR not generating

- Check `NEXT_PUBLIC_APP_URL` is set correctly
- Verify table ID is valid (non-empty string)
- Check browser console for errors

### QR leads to wrong URL

- Verify `NEXT_PUBLIC_APP_URL` environment variable
- For production, use full deployment URL (e.g., https://smartmenu.vercel.app)

### Print dialog not opening

- Check browser popup blocker settings
- Try using Firefox or Chrome (best print support)

---

**Last Updated:** April 27, 2026
