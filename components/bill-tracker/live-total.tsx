// live-total.tsx
"use client";

import { Button } from "@/components/ui/button";
import { useAnimatedNumber } from "@/hooks/use-animated-number";
import { CurrencyCode, formatCurrency } from "@/lib/currency";
import { MeetingSettingsDropdown } from "./meeting-settings-dropdown";
import type { Id } from "@/convex/_generated/dataModel";

interface LiveTotalProps {
  participants: number;
  currency: CurrencyCode;
  hourlyWage: number;
  elapsedSeconds: number;
  total: number;
  readonly?: boolean;
  // Required when readonly=false
  meetingId?: Id<"meetings">;
  controlToken?: string;
  status?: "tracking" | "paused";
  onPauseResume?: () => void;
  onStop?: () => void;
  onFinish?: () => void;
}

export function LiveTotal({
  participants,
  currency,
  hourlyWage,
  elapsedSeconds,
  total,
  readonly = false,
  meetingId,
  controlToken,
  status = "tracking",
  onPauseResume,
  onStop,
  onFinish,
}: LiveTotalProps) {
  const animatedTotal = useAnimatedNumber(total, 0.85);

  return (
    <div className="relative overflow-hidden rounded-lg border bg-white/60 p-6 dark:border-slate-800 dark:bg-slate-900/60">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(600px_200px_at_50%_-20%,rgba(59,130,246,0.15),transparent)] dark:bg-[radial-gradient(600px_200px_at_50%_-20%,rgba(59,130,246,0.25),transparent)]" />
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-muted-foreground">
          Running total
        </div>
      </div>

      {!readonly && meetingId && controlToken && (
        <div className="absolute right-4 top-4">
          <MeetingSettingsDropdown
            meetingId={meetingId}
            controlToken={controlToken}
            participants={participants}
            hourlyWage={hourlyWage}
            currency={currency}
          />
        </div>
      )}

      <div className="tabular-nums mt-4 text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
        {formatCurrency(animatedTotal, currency)}
      </div>

      <p className="mt-3 text-sm text-muted-foreground">
        {participants} participants ×{" "}
        {formatCurrency(hourlyWage, currency, 0, 0)}/h
      </p>

      <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
          {Math.floor(elapsedSeconds / 60)
            .toString()
            .padStart(2, "0")}
          :{(elapsedSeconds % 60).toString().padStart(2, "0")}
        </span>
        <span>elapsed</span>
      </div>

      {!readonly && (
        <div className="mt-6 grid gap-3 sm:flex">
          <Button variant="secondary" onClick={onPauseResume}>
            {status === "tracking" ? "Pause" : "Resume"}
          </Button>
          <Button variant="destructive" onClick={onStop}>
            Stop & reset
          </Button>
          <Button onClick={onFinish}>Finish</Button>
        </div>
      )}
    </div>
  );
}
