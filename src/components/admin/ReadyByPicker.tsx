'use client';

import { useState } from 'react';
import { Clock, X } from 'lucide-react';
import { useNow } from '@/hooks/use-now';
import { cn } from '@/utils/cn';
import { formatClock, formatCountdown, timeInputToDate, dateToTimeInput } from '@/utils/time';

const QUICK_MINUTES = [5, 10, 15, 20, 30];

interface ReadyByPickerProps {
  /** Current ready-by time (ISO), if set. */
  value?: string | null;
  /** Called with the new ready-by time, or null to clear it. */
  onChange: (readyBy: Date | null) => void;
  disabled?: boolean;
  /** Caption above the chips, e.g. "Accept with ready time". */
  label?: string;
  className?: string;
}

/**
 * Fastest way to set an ETA: one tap on a minutes chip, or type a time
 * (time only — today, or tomorrow if that time already passed).
 */
export function ReadyByPicker({ value, onChange, disabled, label = 'Ready time', className }: ReadyByPickerProps) {
  const now = useNow();
  const [custom, setCustom] = useState('');

  const readyAt = value ? new Date(value).getTime() : null;
  const msLeft = readyAt !== null ? readyAt - now : null;

  const commitCustom = () => {
    const date = timeInputToDate(custom);
    if (date) {
      onChange(date);
      setCustom('');
    }
  };

  return (
    <div className={cn('space-y-1.5', className)}>
      {readyAt !== null ? (
        <div className="flex items-center justify-between gap-2 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-sm">
          <span className="flex min-w-0 items-center gap-1.5 font-semibold text-indigo-700">
            <Clock className="h-4 w-4 shrink-0" />
            <span className="whitespace-nowrap">Ready {formatClock(readyAt)}</span>
            <span
              className={cn(
                'whitespace-nowrap font-mono text-xs font-medium',
                msLeft !== null && msLeft < 0 ? 'text-red-600' : 'text-indigo-500'
              )}
            >
              {msLeft !== null && msLeft >= 0 ? formatCountdown(msLeft) : 'overdue'}
            </span>
          </span>
          <button
            type="button"
            onClick={() => onChange(null)}
            disabled={disabled}
            className="rounded p-0.5 text-indigo-400 hover:bg-indigo-100 hover:text-indigo-700"
            aria-label="Clear ready time"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      )}

      <div className="grid grid-cols-5 gap-1">
        {QUICK_MINUTES.map((minutes) => (
          <button
            key={minutes}
            type="button"
            disabled={disabled}
            onClick={() => onChange(new Date(Date.now() + minutes * 60000))}
            title={`Ready in ${minutes} minutes`}
            className="rounded-md border border-slate-200 bg-white py-1 text-xs font-semibold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 active:scale-95 disabled:opacity-50"
          >
            {minutes}m
          </button>
        ))}
      </div>

      <form
        className="flex items-center gap-1"
        onSubmit={(event) => {
          event.preventDefault();
          commitCustom();
        }}
      >
        <input
          type="time"
          step={60}
          value={custom}
          onChange={(event) => setCustom(event.target.value)}
          onFocus={() => !custom && setCustom(dateToTimeInput(readyAt ?? Date.now() + 15 * 60000))}
          disabled={disabled}
          aria-label="Custom ready time"
          className="h-7 min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
        <button
          type="submit"
          disabled={disabled || !custom}
          className="h-7 rounded-md bg-indigo-600 px-3 text-xs font-semibold text-white transition hover:bg-indigo-700 active:scale-95 disabled:bg-slate-200 disabled:text-slate-400"
        >
          Set
        </button>
      </form>
    </div>
  );
}
