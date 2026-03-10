/**
 * Formats a number with thousand separators and 2 decimal places.
 * e.g. 1234567.8 → "$1,234,567.80"
 */
export function fmtCurrency(value: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

/**
 * Formats a plain integer / quantity with thousand separators.
 * e.g. 123450 → "123,450"
 */
export function fmtQty(value: number): string {
    return new Intl.NumberFormat("en-US").format(value);
}
