# Menu media (Cloudinary)

Admins attach a cover image, up to 8 gallery images, a video and a 3D model (`.glb`) to each menu
item in **Admin → Menu**. Files go straight from the browser to Cloudinary. The app server only
signs uploads and stores the resulting URLs.

## Setup

1. Create a Cloudinary account and open **Settings → API Keys**.
2. Set these in `.env`:

   ```
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   ```

3. Restart the dev server. Without these values the app still runs, but uploads fail with
   "Media uploads are not configured on this server" (HTTP 503).

No upload preset is needed. Every upload is signed.

## Flow

```
Browser ── POST /api/media/sign { kind } ──▶ server (admin only)
        ◀── { uploadUrl, fields (incl. signature), maxBytes }
        ── POST file + fields ──▶ Cloudinary
        ◀── { secure_url, ... }
        ── POST/PUT /api/products ──▶ server checks the URLs, then saves
```

| Kind | Cloudinary resource | Formats | Browser limit |
| --- | --- | --- | --- |
| `image` | image | jpg, jpeg, png, webp, avif | 10 MB |
| `video` | video | mp4, mov, webm | 100 MB |
| `model` | image (Cloudinary 3D) | glb | 10 MB |

## Security

- The API secret never leaves the server. Each signature pins a single
  `public_id = visiondine/{restaurantId}/products/{kind}/{uuid}` (no overwrite) and the allowed
  formats, so a client can't upload elsewhere or upload other file types.
- When a product is saved, every gallery, video and model URL must be a `res.cloudinary.com` URL
  from our cloud **inside that restaurant's folder** and of the right kind. `publicId` is worked
  out on the server from the URL and is never taken from the client. The cover image may also be
  an external URL, so older menus keep working.
- Files that are removed or replaced, and all files of a deleted product, are deleted from
  Cloudinary after the response is sent (`after()`). This is best effort; failures are only logged.

## Code map

| File | Role |
| --- | --- |
| `src/lib/media-rules.ts` | Kinds, formats and size limits (shared by client and server) |
| `src/services/media-service.ts` | Signing, URL ownership checks, asset deletion (server) |
| `src/lib/product-media.ts` | Converts validated input into stored product media and works out removed files |
| `src/app/api/media/sign/route.ts` | Signing endpoint |
| `src/lib/media-client.ts`, `src/hooks/use-media-upload.ts` | Browser upload with progress and cancel |
| `src/components/admin/MediaUploader.tsx`, `ProductMediaFields.tsx` | Admin UI |

## Product fields

- `image`: cover URL
- `gallery[]` and `video`: `{ url, publicId, width, height, bytes, format, duration }`
- `model3d`: `{ status: none|queued|processing|ready|failed, source: pipeline|manual, glbUrl, posterUrl, publicId, error }`

The `queued` and `processing` states are reserved for the video → glb pipeline (Task 4).

## Known limitation

If an admin uploads a file and then closes the form without saving, that file stays in Cloudinary
as an orphan. A periodic cleanup job can sweep these up later.
