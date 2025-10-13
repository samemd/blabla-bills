"use client";

import { Milestone } from "@/components/milestone/milestone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CurrencyCode, formatCurrency } from "@/lib/currency";
import { ThingInCurrency } from "@/lib/things";
import { cn, formatDuration } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { MeetingStats } from "./meeting-stats";

interface SummaryStepProps {
  participants: number;
  currency: CurrencyCode;
  hourlyWage: number;
  finalElapsedSeconds: number;
  finalTotal: number;
  unlockedThings: ThingInCurrency[];
  onNewMeeting: () => void;
}

export function SummaryStep({
  participants,
  currency,
  hourlyWage,
  finalElapsedSeconds,
  finalTotal,
  unlockedThings,
  onNewMeeting,
}: SummaryStepProps) {
  const [showAllItems, setShowAllItems] = useState(false);

  return (
    <Card>
      <CardContent className="p-6 md:p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground">
            Meeting Summary
          </h2>
          <p className="mt-2 text-muted-foreground">
            Here&apos;s what this meeting cost your organization
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="text-center">
            <div className="text-4xl font-bold text-foreground">
              {formatCurrency(
                finalElapsedSeconds > 0
                  ? (finalTotal / finalElapsedSeconds) * 60
                  : 0,
                currency
              )}
            </div>
            <p className="text-sm text-muted-foreground">Cost per minute</p>
          </div>

          <div className="text-center">
            <div className="text-4xl font-bold text-foreground">
              {formatDuration(finalElapsedSeconds)}
            </div>
            <p className="text-sm text-muted-foreground">Time wasted</p>
          </div>

          <div className="text-center">
            <div className="text-4xl font-bold text-foreground">
              {formatCurrency(finalTotal, currency)}
            </div>
            <p className="text-sm text-muted-foreground">Money wasted</p>
          </div>
        </div>

        <Separator className="my-8" />

        <MeetingStats
          participants={participants}
          currency={currency}
          hourlyWage={hourlyWage}
          finalElapsedSeconds={finalElapsedSeconds}
        />

        {unlockedThings.length > 0 && (
          <>
            <Separator className="my-8" />
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">
                  Items you could have bought instead
                </h3>
                {unlockedThings.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAllItems(!showAllItems)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {showAllItems
                      ? "Show less"
                      : `Show all ${unlockedThings.length}`}
                    <ChevronDown
                      className={cn("size-4 transition-transform", {
                        "rotate-180": showAllItems,
                      })}
                    />
                  </Button>
                )}
              </div>

              <div className="mt-4">
                <div className="mb-3">
                  <Milestone
                    thing={unlockedThings[unlockedThings.length - 1]}
                    currency={currency}
                  />
                </div>
                <AnimatePresence>
                  {showAllItems && unlockedThings.length > 1 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-1 gap-3">
                        {unlockedThings
                          .slice(0, -1)
                          .reverse()
                          .map((thing) => (
                            <Milestone
                              key={thing.name}
                              thing={thing}
                              currency={currency}
                            />
                          ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </>
        )}

        <div className="mt-8 flex justify-center gap-3">
          <Button onClick={onNewMeeting} variant="special">
            Track New Meeting
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
