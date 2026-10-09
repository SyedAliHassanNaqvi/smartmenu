import { useId } from 'react';
import { Sora } from 'next/font/google';
import { cn } from '@/utils/cn';

const sora = Sora({ subsets: ['latin'], weight: ['600', '800'] });

/** Hardcoded to the site palette (indigo-600, violet-600, slate-900) so the logo renders on any background. */
const INDIGO = '#4F46E5';
const INDIGO_LIGHT = '#6366F1';
const VIOLET = '#7C3AED';
const INK = '#0F172A';
const INDIGO_SOFT = '#A5B4FC';

interface BrandMarkProps {
  className?: string;
  size?: number;
}

/**
 * Vision Dine mark: a serving cloche whose dome holds an eye, with an AI spark.
 */
export function BrandMark({ className, size = 40 }: BrandMarkProps) {
  const gradientId = useId();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role="img"
      aria-hidden="true"
      className={cn('shrink-0 drop-shadow-[0_4px_10px_rgba(79,70,229,0.35)]', className)}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={INDIGO_LIGHT} />
          <stop offset="1" stopColor={VIOLET} />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="13" fill={`url(#${gradientId})`} />
      {/* cloche knob + dome + plate */}
      <circle cx="24" cy="17.6" r="1.9" fill="#FFFFFF" />
      <path d="M12 32 A12 12 0 0 1 36 32 Z" fill="#FFFFFF" />
      <rect x="9" y="33" width="30" height="2.8" rx="1.4" fill="#FFFFFF" />
      {/* eye inside the dome */}
      <path d="M16.5 26.6 Q24 20.4 31.5 26.6 Q24 32.8 16.5 26.6 Z" fill={INDIGO} />
      <circle cx="24" cy="26.6" r="3.3" fill="#FFFFFF" />
      <circle cx="24" cy="26.6" r="1.7" fill={VIOLET} />
      <circle cx="24.7" cy="25.9" r="0.55" fill="#FFFFFF" />
      {/* AI spark */}
      <path
        d="M37 7.5 L38.1 10.4 L41 11.5 L38.1 12.6 L37 15.5 L35.9 12.6 L33 11.5 L35.9 10.4 Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

interface BrandLogoProps {
  className?: string;
  /** Show only the mark. */
  iconOnly?: boolean;
  /** Light wordmark for dark backgrounds. */
  inverted?: boolean;
  size?: 'sm' | 'md' | 'lg';
  /** Small caption under the wordmark. */
  tagline?: string;
}

const SIZES = {
  sm: { mark: 32, text: 'text-lg', tag: 'text-[9px]' },
  md: { mark: 40, text: 'text-[22px]', tag: 'text-[10px]' },
  lg: { mark: 52, text: 'text-3xl', tag: 'text-xs' },
} as const;

/**
 * Vision Dine logo: the mark plus a two-tone wordmark.
 */
export function BrandLogo({
  className,
  iconOnly = false,
  inverted = false,
  size = 'md',
  tagline,
}: BrandLogoProps) {
  const s = SIZES[size];

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <BrandMark size={s.mark} />
      {!iconOnly && (
        <div className="flex flex-col leading-none">
          <span className={cn(sora.className, s.text, 'font-extrabold tracking-tight')}>
            <span style={{ color: inverted ? '#FFFFFF' : INK }}>Vision</span>
            <span style={{ color: inverted ? INDIGO_SOFT : INDIGO }}>Dine</span>
          </span>
          {tagline && (
            <span
              className={cn(sora.className, s.tag, 'mt-1 font-semibold uppercase tracking-[0.18em]')}
              style={{ color: inverted ? 'rgba(255,255,255,0.6)' : '#64748B' }}
            >
              {tagline}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
