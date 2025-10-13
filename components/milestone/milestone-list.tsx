"use client";

import { Milestone } from "@/components/milestone/milestone";
import { CurrencyCode } from "@/lib/currency";
import { ThingInCurrency } from "@/lib/things";
import { AnimatePresence } from "framer-motion";

type MilestonesProps = {
  things: ThingInCurrency[];
  currency: CurrencyCode;
};

export function MilestoneList({ things, currency }: MilestonesProps) {
  return (
    <div className="mt-8">
      <div className="mb-3 text-sm font-medium text-muted-foreground">
        Milestones unlocked
      </div>
      <div className="relative">
        <div className="relative grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence initial={false}>
            {things
              .slice()
              .map((t) => (
                <Milestone key={t.name} thing={t} currency={currency} />
              ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
