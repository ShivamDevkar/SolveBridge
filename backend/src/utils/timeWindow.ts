export interface ParsedTimeWindow {
  start: string | null; // "HH:MM"
  end: string | null; // "HH:MM"
}

/**
 * Parses a human time-window string such as
 * "Morning (08:00 AM - 12:00 PM)" into 24-hour "HH:MM" times.
 * Returns null times when the string cannot be parsed (e.g. "Any time / Flexible").
 */
export function parseTimeWindow(value: string): ParsedTimeWindow {
  const match = value.match(
    /\(?(\d{1,2}):(\d{2})\s*(AM|PM)\s*[-–]\s*(\d{1,2}):(\d{2})\s*(AM|PM)\)?/i,
  );

  if (!match) {
    return { start: null, end: null };
  }

  const start = to24Hour(Number(match[1]), Number(match[2]), match[3]);
  const end = to24Hour(Number(match[4]), Number(match[5]), match[6]);

  return { start, end };
}

function to24Hour(hours: number, minutes: number, meridiem: string): string {
  const normalized = hours % 12 + (meridiem.toUpperCase() === "PM" ? 12 : 0);
  return `${String(normalized).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/** Formats a parsed "HH:MM" pair back into a display string. */
export function formatTimeWindow(start: string | null, end: string | null): string {
  if (start && end) {
    return `${start} - ${end}`;
  }
  return "Any time / Flexible";
}
