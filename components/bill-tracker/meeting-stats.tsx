"use client";

import { CurrencyCode, formatCurrency } from "@/lib/currency";
import {
  calculateWeightedAverages,
  formatDuration,
  SettingsHistoryEntry,
} from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface MeetingStatsProps {
  participants: number;
  currency: CurrencyCode;
  hourlyWage: number;
  finalElapsedSeconds: number;
  meetingStartedAt: number;
  settingsHistory?: SettingsHistoryEntry[];
}

interface SettingsHistoryTooltipProps {
  settingsHistory: SettingsHistoryEntry[];
  meetingStartedAt: number;
  currency: CurrencyCode;
}

function formatTimeOffset(timestamp: number, meetingStartedAt: number): string {
  const offsetSeconds = Math.floor((timestamp - meetingStartedAt) / 1000);
  return formatDuration(Math.max(0, offsetSeconds));
}

function SettingsHistoryTooltip({
  settingsHistory,
  meetingStartedAt,
  currency,
}: SettingsHistoryTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button className="ml-1 inline-flex items-center text-muted-foreground hover:text-foreground">
          <Info className="h-3.5 w-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs">
        <div className="space-y-1 text-left">
          <div className="font-medium mb-2">Settings history</div>
          {settingsHistory.map((entry, index) => (
            <div key={index} className="text-xs">
              {formatTimeOffset(entry.timestamp, meetingStartedAt)} -{" "}
              {entry.participants} participants @{" "}
              {formatCurrency(entry.hourlyWage, currency, 0, 0)}/h
            </div>
          ))}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

export function MeetingStats({
  participants,
  currency,
  hourlyWage,
  finalElapsedSeconds,
  meetingStartedAt,
  settingsHistory,
}: MeetingStatsProps) {
  const averages =
    settingsHistory ?
      calculateWeightedAverages(
        settingsHistory,
        meetingStartedAt,
        finalElapsedSeconds
      )
    : null;

  const hasVariation = averages?.hasVariation ?? false;
  const displayParticipants =
    hasVariation ? averages!.avgParticipants : participants;
  const displayHourlyWage = hasVariation ? averages!.avgHourlyWage : hourlyWage;

  // For time investment calculation, use weighted average participants
  const effectiveParticipants =
    hasVariation ? averages!.avgParticipants : participants;

  return (
    <div className="grid gap-4 sm:grid-cols-2 justify-items-center">
      <div className="text-center sm:text-start">
        <h3 className="font-semibold text-foreground">Meeting Details</h3>
        <div className="mt-2 space-y-1 text-sm text-muted-foreground">
          <div className="flex items-center justify-center sm:justify-start">
            {hasVariation && settingsHistory ?
              <>
                ~{displayParticipants.toFixed(1)} participants (avg)
                <SettingsHistoryTooltip
                  settingsHistory={settingsHistory}
                  meetingStartedAt={meetingStartedAt}
                  currency={currency}
                />
              </>
            : <>{participants} participants</>}
          </div>
          <div className="flex items-center justify-center sm:justify-start">
            {hasVariation && settingsHistory ?
              <>
                {formatCurrency(displayHourlyWage, currency, 0, 0)} hourly rate
                (avg)
                <SettingsHistoryTooltip
                  settingsHistory={settingsHistory}
                  meetingStartedAt={meetingStartedAt}
                  currency={currency}
                />
              </>
            : <>
                {formatCurrency(hourlyWage, currency, 0, 0)} average hourly rate
              </>
            }
          </div>
          <div>
            {formatCurrency(
              (displayParticipants * displayHourlyWage) / 60,
              currency
            )}{" "}
            cost per minute{hasVariation ? " (avg)" : ""}
          </div>
        </div>
      </div>

      <div className="text-center sm:text-start">
        <h3 className="font-semibold text-foreground">Time Investment</h3>
        <div className="mt-2 space-y-1 text-sm text-muted-foreground">
          <div>
            {((finalElapsedSeconds * effectiveParticipants) / 60).toFixed(1)}{" "}
            total person-minutes{hasVariation ? " (avg)" : ""}
          </div>
          <div>
            {((finalElapsedSeconds * effectiveParticipants) / 3600).toFixed(1)}{" "}
            total person-hours{hasVariation ? " (avg)" : ""}
          </div>
          <div>
            {(
              (finalElapsedSeconds * effectiveParticipants) /
              (8 * 3600)
            ).toFixed(2)}{" "}
            person-days{hasVariation ? " (avg)" : ""}
            {(finalElapsedSeconds * effectiveParticipants) / (8 * 3600) >= 1 ?
              " 🤯"
            : ""}
          </div>
        </div>
      </div>
    </div>
  );
}
