/**
 * Formats a Date or date string to dd/mm/yyyy format (e.g., 04/09/2026).
 */
export function formatDate(dateInput: Date | string | number | null | undefined): string {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Formats a Date or date string to dd/mm/yyyy, hh:mm AM/PM format (e.g., 04/09/2026, 12:04 PM).
 */
export function formatDateTime(dateInput: Date | string | number | null | undefined): string {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const formattedHours = String(hours).padStart(2, '0');
  return `${day}/${month}/${year}, ${formattedHours}:${minutes} ${ampm}`;
}
