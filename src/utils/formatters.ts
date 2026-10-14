/**
 * Formats a number in Bangladeshi Taka numbering style (e.g. 1,00,000)
 */
export function formatBDT(amount: number, includeSymbol: boolean = true): string {
  if (isNaN(amount)) return includeSymbol ? '৳ 0' : '0';
  
  // Using en-BD locale which formats as lakhs and crores (e.g. 1,00,000)
  const formatted = new Intl.NumberFormat('en-BD', {
    maximumFractionDigits: 0,
  }).format(Math.round(amount));

  return includeSymbol ? `৳ ${formatted}` : formatted;
}

/**
 * Formats amount into readable Bangladeshi units (Lakhs / Crores) for quick glance
 */
export function formatBDTCompact(amount: number): string {
  if (isNaN(amount)) return '৳ 0';
  const abs = Math.abs(amount);
  if (abs >= 10000000) {
    return `৳ ${(amount / 10000000).toFixed(2)} Cr`;
  } else if (abs >= 100000) {
    return `৳ ${(amount / 100000).toFixed(2)} Lakh`;
  } else if (abs >= 1000) {
    return `৳ ${(amount / 1000).toFixed(1)}k`;
  }
  return `৳ ${Math.round(amount)}`;
}
