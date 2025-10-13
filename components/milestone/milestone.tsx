import { CurrencyCode, formatCurrency } from "@/lib/currency";
import { ThingInCurrency } from "@/lib/things";
import { motion } from "framer-motion";

type MilestoneProps = {
  thing: ThingInCurrency;
  currency: CurrencyCode;
};

export function Milestone({ thing, currency }: MilestoneProps) {
  return (
    <motion.div
      key={thing.name}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="group relative rounded-lg border bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/80"
    >
      <div className="absolute -top-2 left-4 inline-flex items-center rounded-full border bg-white px-2 py-0.5 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        {formatCurrency(thing.price, currency)}
      </div>
      <div className="mt-2 flex items-center gap-3">
        <div className="text-2xl">{thing.emoji}</div>
        <div className="font-medium text-slate-800 dark:text-slate-200">
          {thing.name}
        </div>
      </div>
    </motion.div>
  );
}
