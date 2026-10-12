/**
 * Formats a number in Rwandan Francs (Rwf) with thousand separators.
 * e.g. 1234567 → "1,234,567 Rwf", 1234.5 → "1,234.50 Rwf"
 */
export function fmtCurrency(value: number): string {
    const num = Number(value) || 0;
    const isNegative = num < 0;
    const abs = Math.abs(num);
    const hasDecimals = !Number.isInteger(abs) && (abs % 1 !== 0);
    const formatted = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: hasDecimals ? 2 : 0,
        maximumFractionDigits: 2,
    }).format(abs);
    return `${isNegative ? "-" : ""}${formatted} Rwf`;
}

/**
 * Formats a plain integer / quantity with thousand separators.
 * e.g. 123450 → "123,450"
 */
export function fmtQty(value: number): string {
    return new Intl.NumberFormat("en-US").format(value);
}
