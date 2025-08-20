"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CurrencyCode, formatCurrency } from "@/lib/currency";
import { ThingInCurrency } from "@/lib/things";
import { useMemo } from "react";

type MilestonesProps = {
  things: ThingInCurrency[];
  total: number;
  currency: CurrencyCode;
};

export function Milestones({ things, total, currency }: MilestonesProps) {
  const unlockedThings = useMemo(
    () => things.filter((t) => total >= t.price),
    [total, things],
  );

  return (
    <div className="mt-8">
      <div className="mb-3 text-sm font-medium text-muted-foreground">
        Milestones unlocked
      </div>
      <div className="relative">
        <div className="relative grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence initial={false}>
            {unlockedThings.map((t) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="group relative rounded-lg border bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/80"
              >
                <div className="absolute -top-2 left-4 inline-flex items-center rounded-full border bg-white px-2 py-0.5 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                  {formatCurrency(t.price, currency, 0, 1)}
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <div className="text-2xl">{t.emoji}</div>
                  <div className="font-medium text-slate-800 dark:text-slate-200">
                    {t.name}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
