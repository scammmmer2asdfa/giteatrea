const UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const;

export function formatBytes(bytes: number, precision = 1): string {
  if (bytes === 0) return '0 B';
  const exponent = Math.min(
    Math.floor(Math.log(Math.abs(bytes)) / Math.log(1024)),
    UNITS.length - 1,
  );
  const value = bytes / 1024 ** exponent;
  return `${value.toFixed(exponent === 0 ? 0 : precision)} ${UNITS[exponent]}`;
}

/** Compact number formatting, e.g. 1234 -> "1.2k". */
export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(
    value,
  );
}

export function timeAgo(isoDate: string, now: Date = new Date()): string {
  const date = new Date(isoDate);
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
  const ranges: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 60 * 60 * 24 * 365],
    ['month', 60 * 60 * 24 * 30],
    ['week', 60 * 60 * 24 * 7],
    ['day', 60 * 60 * 24],
    ['hour', 60 * 60],
    ['minute', 60],
  ];
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  for (const [unit, secondsInUnit] of ranges) {
    if (Math.abs(seconds) >= secondsInUnit) {
      return rtf.format(-Math.round(seconds / secondsInUnit), unit);
    }
  }
  return rtf.format(-seconds, 'second');
}

export function getFileExtension(path: string): string | undefined {
  const base = path.split('/').pop() ?? path;
  const dotIndex = base.lastIndexOf('.');
  if (dotIndex <= 0) return undefined;
  return base.slice(dotIndex + 1).toLowerCase();
}
