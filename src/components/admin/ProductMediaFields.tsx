'use client';

import { useEffect, useState } from 'react';
import { Box, ExternalLink, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MediaUploader } from '@/components/admin/MediaUploader';
import { thumbnailUrl, type UploadedMedia } from '@/lib/media-client';
import { MAX_GALLERY_IMAGES, type Model3dStatus } from '@/lib/media-rules';
import type { Model3d } from '@/types/media';

export interface ProductMediaValue {
  /** Cover image URL; empty string when none. */
  image: string;
  gallery: UploadedMedia[];
  video: UploadedMedia | null;
  /** Only `glbUrl`/`posterUrl` are editable; the rest is shown for status. */
  model3d: Pick<Model3d, 'glbUrl' | 'posterUrl' | 'status' | 'source'> | null;
}

export const emptyProductMedia: ProductMediaValue = {
  image: '',
  gallery: [],
  video: null,
  model3d: null,
};

const MODEL_STATUS_STYLES: Record<Model3dStatus, string> = {
  none: 'bg-gray-100 text-gray-700',
  queued: 'bg-amber-100 text-amber-800',
  processing: 'bg-blue-100 text-blue-800',
  ready: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
};

interface ProductMediaFieldsProps {
  value: ProductMediaValue;
  onChange: (update: (prev: ProductMediaValue) => ProductMediaValue) => void;
  /** True while any upload in this section is in flight. */
  onBusyChange: (busy: boolean) => void;
}

function RemoveButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
    >
      <X className="h-3 w-3" />
    </button>
  );
}

function SectionLabel({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="mb-2">
      <p className="text-sm font-medium text-gray-900">{title}</p>
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

/**
 * Media section of the menu item form: cover image, gallery, video and a
 * manually uploaded 3D model. Uploads go straight to Cloudinary.
 */
export function ProductMediaFields({ value, onChange, onBusyChange }: ProductMediaFieldsProps) {
  const [busySlots, setBusySlots] = useState<Record<string, boolean>>({});
  const [pasteCoverUrl, setPasteCoverUrl] = useState(false);

  // Stable per-slot callbacks so MediaUploader's effect does not re-fire.
  const [slotHandlers] = useState(() => {
    const busyFor = (slot: string) => (busy: boolean) =>
      setBusySlots((prev) => (prev[slot] === busy ? prev : { ...prev, [slot]: busy }));
    return {
      cover: busyFor('cover'),
      gallery: busyFor('gallery'),
      video: busyFor('video'),
      model: busyFor('model'),
    };
  });

  useEffect(() => {
    onBusyChange(Object.values(busySlots).some(Boolean));
  }, [busySlots, onBusyChange]);

  const galleryRemaining = MAX_GALLERY_IMAGES - value.gallery.length;
  const modelStatus = value.model3d?.status ?? 'ready';

  return (
    <div className="space-y-5 rounded-lg border border-gray-200 p-4">
      <div>
        <p className="text-base font-semibold text-gray-900">Media</p>
        <p className="text-xs text-gray-500">
          Photos, a short video and a 3D model help diners see the dish before ordering.
        </p>
      </div>

      {/* Cover image */}
      <div>
        <SectionLabel title="Cover image" hint="Shown on the menu card and in the cart." />
        {value.image ? (
          <div className="relative h-28 w-28 overflow-hidden rounded-md border border-gray-200 bg-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={thumbnailUrl(value.image, 224)} alt="Cover" className="h-full w-full object-cover" />
            <RemoveButton
              label="Remove cover image"
              onClick={() => onChange((prev) => ({ ...prev, image: '' }))}
            />
          </div>
        ) : pasteCoverUrl ? (
          <Input
            type="url"
            placeholder="https://example.com/image.jpg — press Enter to use"
            onBlur={(e) => {
              const url = e.target.value.trim();
              if (url) onChange((prev) => ({ ...prev, image: url }));
            }}
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return;
              e.preventDefault(); // Do not submit the whole form.
              const url = e.currentTarget.value.trim();
              if (url) onChange((prev) => ({ ...prev, image: url }));
            }}
          />
        ) : (
          <MediaUploader
            kind="image"
            label="Upload cover image"
            onUploaded={(media) => onChange((prev) => ({ ...prev, image: media.url }))}
            onBusyChange={slotHandlers.cover}
          />
        )}
        {!value.image && (
          <button
            type="button"
            onClick={() => setPasteCoverUrl((prev) => !prev)}
            className="mt-1 text-xs text-gray-600 underline hover:text-gray-900"
          >
            {pasteCoverUrl ? 'Upload a file instead' : 'Paste an image URL instead'}
          </button>
        )}
      </div>

      {/* Gallery */}
      <div>
        <SectionLabel
          title={`Gallery (${value.gallery.length}/${MAX_GALLERY_IMAGES})`}
          hint="Extra photos of the dish."
        />
        {value.gallery.length > 0 && (
          <div className="mb-2 grid grid-cols-4 gap-2 sm:grid-cols-6">
            {value.gallery.map((item, index) => (
              <div
                key={item.url}
                className="relative aspect-square overflow-hidden rounded-md border border-gray-200 bg-gray-100"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumbnailUrl(item.url)}
                  alt={`Gallery image ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                <RemoveButton
                  label={`Remove gallery image ${index + 1}`}
                  onClick={() =>
                    onChange((prev) => ({
                      ...prev,
                      gallery: prev.gallery.filter((entry) => entry.url !== item.url),
                    }))
                  }
                />
              </div>
            ))}
          </div>
        )}
        {galleryRemaining > 0 && (
          <MediaUploader
            kind="image"
            label="Add gallery photos"
            multiple
            maxFiles={galleryRemaining}
            onUploaded={(media) =>
              onChange((prev) =>
                prev.gallery.length >= MAX_GALLERY_IMAGES
                  ? prev
                  : { ...prev, gallery: [...prev.gallery, media] }
              )
            }
            onBusyChange={slotHandlers.gallery}
          />
        )}
      </div>

      {/* Video */}
      <div>
        <SectionLabel title="Video" hint="A short clip of the dish." />
        {value.video ? (
          <div className="w-full max-w-sm">
            <div className="relative overflow-hidden rounded-md border border-gray-200 bg-black">
              <video src={value.video.url} controls preload="metadata" className="max-h-56 w-full" />
              <RemoveButton
                label="Remove video"
                onClick={() => onChange((prev) => ({ ...prev, video: null }))}
              />
            </div>
            {value.video.duration != null && (
              <p className="mt-1 text-xs text-gray-500">{Math.round(value.video.duration)} seconds</p>
            )}
          </div>
        ) : (
          <MediaUploader
            kind="video"
            label="Upload dish video"
            onUploaded={(media) => onChange((prev) => ({ ...prev, video: media }))}
            onBusyChange={slotHandlers.video}
          />
        )}
      </div>

      {/* 3D model */}
      <div>
        <SectionLabel
          title="3D model"
          hint="Optional. Upload a ready-made .glb model to enable the 3D and AR view."
        />
        {value.model3d?.glbUrl ? (
          <div className="flex flex-wrap items-center gap-3 rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
            <Box className="h-5 w-5 text-gray-600" />
            <Badge className={MODEL_STATUS_STYLES[modelStatus]}>{modelStatus}</Badge>
            <span className="text-xs text-gray-600">
              {value.model3d.source === 'pipeline' ? 'Generated from video' : 'Uploaded manually'}
            </span>
            <a
              href={value.model3d.glbUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-gray-700 underline hover:text-gray-900"
            >
              Open file <ExternalLink className="h-3 w-3" />
            </a>
            <button
              type="button"
              onClick={() => onChange((prev) => ({ ...prev, model3d: null }))}
              className="ml-auto text-xs text-red-600 hover:text-red-800"
            >
              Remove
            </button>
          </div>
        ) : (
          <>
            {value.model3d && value.model3d.status !== 'none' && (
              <Badge className={`mb-2 ${MODEL_STATUS_STYLES[value.model3d.status]}`}>
                {value.model3d.status}
              </Badge>
            )}
            <MediaUploader
              kind="model"
              label="Upload 3D model"
              onUploaded={(media) =>
                onChange((prev) => ({
                  ...prev,
                  model3d: { glbUrl: media.url, status: 'ready', source: 'manual' },
                }))
              }
              onBusyChange={slotHandlers.model}
            />
          </>
        )}
      </div>
    </div>
  );
}
