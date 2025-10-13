"use client";

import { Progress } from "@/components/ui/progress";
import { CurrencyCode, formatCurrency } from "@/lib/currency";
import { ThingInCurrency } from "@/lib/things";

type NextMilestoneProps = {
  things: ThingInCurrency[];
  total: number;
  currency: CurrencyCode;
};

export function NextMilestone({ things, total, currency }: NextMilestoneProps) {
  const nextThing = things.find((t) => total < t.price);

  if (!nextThing) return null;

  const prevPrice =
    things
      .filter((t) => t.price < nextThing.price)
      .map((t) => t.price)
      .pop() ?? 0;
  const range = nextThing.price - prevPrice || nextThing.price;
  const progress = ((total - prevPrice) / range) * 100;
  const nextThingProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className="relative rounded-lg border bg-white/60 p-6 dark:border-slate-800 dark:bg-slate-900/60">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(600px_200px_at_50%_-20%,rgba(59,130,246,0.15),transparent)] dark:bg-[radial-gradient(600px_200px_at_50%_-20%,rgba(59,130,246,0.25),transparent)]" />
      <div className="text-sm font-medium text-muted-foreground">
        What you could’ve bought
      </div>

      <div className="mt-4">
        {nextThing ? (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <span className="text-xl">{nextThing.emoji}</span>
                <span className="font-semibold">{nextThing.name}</span>
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {formatCurrency(nextThing.price, currency)}
              </div>
            </div>
            <Progress className="mt-3" value={nextThingProgress} />
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {Math.round(nextThingProgress)}% to next item
            </div>
          </>
        ) : (
          <div className="text-slate-600 dark:text-slate-300">
            You’ve unlocked everything on our list. Legendary.
          </div>
        )}
      </div>
    </div>
  );
}
