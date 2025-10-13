export type CurrencyCode = "CHF" | "EUR" | "USD" | "GBP";

export const CURRENCIES: {
  code: CurrencyCode;
  symbol: string;
  label: string;
  eurRate: number; // multiply EUR by this to get currency
}[] = [
    { code: "CHF", symbol: "CHF", label: "CHF — Swiss Franc", eurRate: 0.95 },
    { code: "EUR", symbol: "€", label: "EUR — Euro", eurRate: 1 },
    { code: "USD", symbol: "$", label: "USD — US Dollar", eurRate: 1.15 },
    { code: "GBP", symbol: "£", label: "GBP — British Pound", eurRate: 0.85 },
  ];

const CurrencyLocaleMap: Record<CurrencyCode, string> = {
  CHF: "de-CH",
  EUR: "de-DE",
  USD: "en-US",
  GBP: "en-GB",
};

export function formatCurrency(
  value: number,
  currency: CurrencyCode,
  minFrac = 2,
  maxFrac = 2,
) {
  const locale = CurrencyLocaleMap[currency] || "de-CH";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: minFrac,
    maximumFractionDigits: maxFrac,
  }).format(value);
}
