import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatCurrency, type CurrencyCode } from "./currency";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface SettingsHistoryEntry {
  timestamp: number;
  participants: number;
  hourlyWage: number;
}

export interface WeightedAverages {
  avgParticipants: number;
  avgHourlyWage: number;
  hasVariation: boolean;
}

export function calculateWeightedAverages(
  settingsHistory: SettingsHistoryEntry[],
  meetingStartedAt: number,
  finalElapsedSeconds: number
): WeightedAverages | null {
  if (settingsHistory.length === 0) {
    return null;
  }

  if (settingsHistory.length === 1) {
    return {
      avgParticipants: settingsHistory[0].participants,
      avgHourlyWage: settingsHistory[0].hourlyWage,
      hasVariation: false,
    };
  }

  const meetingEndTime = meetingStartedAt + finalElapsedSeconds * 1000;

  let totalWeightedParticipants = 0;
  let totalWeightedWage = 0;
  let totalDuration = 0;

  for (let i = 0; i < settingsHistory.length; i++) {
    const segment = settingsHistory[i];
    const segmentStart = segment.timestamp;
    const segmentEnd = settingsHistory[i + 1]?.timestamp ?? meetingEndTime;
    const duration = Math.max(0, (segmentEnd - segmentStart) / 1000); // in seconds

    totalWeightedParticipants += segment.participants * duration;
    totalWeightedWage += segment.hourlyWage * duration;
    totalDuration += duration;
  }

  if (totalDuration === 0) {
    return {
      avgParticipants: settingsHistory[0].participants,
      avgHourlyWage: settingsHistory[0].hourlyWage,
      hasVariation: false,
    };
  }

  return {
    avgParticipants: totalWeightedParticipants / totalDuration,
    avgHourlyWage: totalWeightedWage / totalDuration,
    hasVariation: true,
  };
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
  meetingStartedAt,
  settingsHistory,
}: {
  name: string;
  participants: number;
  finalElapsedSeconds: number;
  finalTotal: number;
  currency: CurrencyCode;
  meetingStartedAt?: number;
  settingsHistory?: SettingsHistoryEntry[];
}): string {
  const costPerMinute =
    finalElapsedSeconds > 0 ? (finalTotal / finalElapsedSeconds) * 60 : 0;

  // Calculate weighted averages if settings history is available
  const averages =
    settingsHistory && meetingStartedAt ?
      calculateWeightedAverages(
        settingsHistory,
        meetingStartedAt,
        finalElapsedSeconds
      )
    : null;

  const hasVariation = averages?.hasVariation ?? false;
  const displayParticipants =
    hasVariation ?
      `~${averages!.avgParticipants.toFixed(1)} (avg)`
    : participants.toString();

  return `${name}

Participants: ${displayParticipants}
Duration: ${formatDuration(finalElapsedSeconds)}
Cost per minute: ${formatCurrency(costPerMinute, currency)}

This meeting wasted a total of ${formatCurrency(finalTotal, currency)}!`;
}

export function getShareableLink(meetingId: string): string {
  if (process.env.NODE_ENV === "development") {
    return `http://localhost:3000/meeting/${meetingId}`;
  }
  return `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}/meeting/${meetingId}`;
}
