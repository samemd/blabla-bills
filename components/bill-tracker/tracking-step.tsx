"use client";

import { MilestoneList } from "@/components/milestone/milestone-list";
import { NextMilestone } from "@/components/milestone/next-milestone";
import { Card, CardContent } from "@/components/ui/card";
import { CurrencyCode } from "@/lib/currency";
import { ThingInCurrency } from "@/lib/things";
import { LiveTotal } from "./live-total";

interface TrackingStepProps {
  participants: number;
  currency: CurrencyCode;
  hourlyWage: number;
  isRunning: boolean;
  elapsedSeconds: number;
  rawTotal: number;
  thingsInCurrency: ThingInCurrency[];
  unlockedThings: ThingInCurrency[];
  onPauseResume: () => void;
  onStop: () => void;
  onFinish: () => void;
}

export function TrackingStep({
  participants,
  currency,
  hourlyWage,
  isRunning,
  elapsedSeconds,
  rawTotal,
  thingsInCurrency,
  unlockedThings,
  onPauseResume,
  onStop,
  onFinish,
}: TrackingStepProps) {
  return (
    <Card className="border-slate-200/70 bg-white/70 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/70">
      <CardContent className="p-6 md:p-8">
        <div className="grid gap-6 md:grid-cols-[1.3fr_1fr]">
          <LiveTotal
            participants={participants}
            currency={currency}
            hourlyWage={hourlyWage}
            isRunning={isRunning}
            elapsedSeconds={elapsedSeconds}
            total={rawTotal}
            onPauseResume={onPauseResume}
            onStop={onStop}
            onFinish={onFinish}
          />
          <NextMilestone
            things={thingsInCurrency}
            total={rawTotal}
            currency={currency}
          />
        </div>
        <MilestoneList things={unlockedThings} currency={currency} />
      </CardContent>
    </Card>
  );
}
