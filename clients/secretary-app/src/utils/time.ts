const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * Format a timestamp as human-readable relative time.
 *
 * @example formatTimeAgo(new Date(Date.now() - 120_000)) // "2 minutes ago"
 */
export function formatTimeAgo(date: Date): string {
  const elapsed = Date.now() - date.getTime();

  if (elapsed < 30 * SECOND) return 'just now';

  if (elapsed < HOUR) {
    const minutes = Math.max(1, Math.floor(elapsed / MINUTE));
    return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
  }

  if (elapsed < DAY) {
    const hours = Math.floor(elapsed / HOUR);
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  }

  const days = Math.floor(elapsed / DAY);
  return days === 1 ? '1 day ago' : `${days} days ago`;
}
