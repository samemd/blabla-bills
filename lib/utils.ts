import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatCurrency, type CurrencyCode } from "./currency";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function getShareableSummary({
  name,
  participants,
  finalElapsedSeconds,
  finalTotal,
  currency,
}: {
  name: string;
  participants: number;
  finalElapsedSeconds: number;
  finalTotal: number;
  currency: CurrencyCode;
}): string {
  const costPerMinute =
    finalElapsedSeconds > 0 ? (finalTotal / finalElapsedSeconds) * 60 : 0;

  return `${name}

Participants: ${participants}
Duration: ${formatDuration(finalElapsedSeconds)}
Cost per minute: ${formatCurrency(costPerMinute, currency)}

Congratulation, this meeting wasted a total of ${formatCurrency(finalTotal, currency)}!`;
}

export function getShareableLink(meetingId: string): string {
  if (process.env.NODE_ENV === "development") {
    return `http://localhost:3000/meeting/${meetingId}`;
  }
  return `https://${process.env.VERCEL_URL}/meeting/${meetingId}`;
}
