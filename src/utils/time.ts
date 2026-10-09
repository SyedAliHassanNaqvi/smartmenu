/**
 * Small time-formatting helpers for order timers (client-safe).
 */

/** "14:35" in the viewer's locale. */
export function formatClock(date: string | number | Date): string {
  return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/** "12:05" (mm:ss) or "1:02:05" for a positive duration in ms. */
export function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const mm = String(minutes).padStart(hours ? 2 : 1, "0");
  const ss = String(seconds).padStart(2, "0");
  return hours ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** "just now", "4 min", "1h 12m", "3d" — elapsed since `date`. */
export function formatElapsed(date: string | number | Date, now: number): string {
  const minutes = Math.max(0, Math.floor((now - new Date(date).getTime()) / 60000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min`;
  if (minutes < 24 * 60) return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  return `${Math.floor(minutes / (24 * 60))}d`;
}

/**
 * Turn an "HH:MM" time (from <input type="time">) into the next matching
 * moment: today, or tomorrow if that time has already passed.
 */
export function timeInputToDate(value: string, now = new Date()): Date | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const date = new Date(now);
  date.setHours(Number(match[1]), Number(match[2]), 0, 0);
  if (date.getTime() <= now.getTime()) date.setDate(date.getDate() + 1);
  return date;
}

/** Date → "HH:MM" for <input type="time">. */
export function dateToTimeInput(date: string | number | Date): string {
  const d = new Date(date);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
