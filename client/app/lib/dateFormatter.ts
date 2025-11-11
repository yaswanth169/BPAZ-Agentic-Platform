import { format, parseISO, formatDistanceToNow, isValid } from "date-fns";
import { tr } from "date-fns/locale";

// Format: 2025-07-17 → 17 July 2025
export const formatDate = (date: string | Date, dateFormat = "dd MMMM yyyy") => {
  const parsed = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(parsed)) return "Invalid date";
  return format(parsed, dateFormat);
};

// Format: 2025-07-17 → 17 July 2025 (Turkish locale)
export const formatDateTR = (date: string | Date, dateFormat = "dd MMMM yyyy") => {
  const parsed = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(parsed)) return "Invalid date";
  return format(parsed, dateFormat, { locale: tr });
};

// Format: 2025-07-17 → 3 days ago
export const timeAgo = (date: string | Date) => {
  const parsed = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(parsed)) return "Invalid date";
  return formatDistanceToNow(parsed, { addSuffix: true });
};

// Format: 2025-07-17 → 3 days ago (Turkish locale)
export const timeAgoTR = (date: string | Date) => {
  const parsed = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(parsed)) return "Invalid date";
  return formatDistanceToNow(parsed, { addSuffix: true, locale: tr });
};