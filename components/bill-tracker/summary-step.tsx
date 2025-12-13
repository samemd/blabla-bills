"use client";

import { Id } from "@/convex/_generated/dataModel";
import { Milestone } from "@/components/milestone/milestone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { CURRENCIES, CurrencyCode, formatCurrency } from "@/lib/currency";
import { ThingInCurrency, THINGS } from "@/lib/things";
import {
  cn,
  formatDuration,
  getShareableLink,
  getShareableSummary,
} from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Copy, Link as LinkIcon, Share2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { MeetingStats } from "./meeting-stats";

interface SummaryStepProps {
  name: string;
  meetingId: Id<"meetings">;
  participants: number;
  currency: CurrencyCode;
  hourlyWage: number;
  finalElapsedSeconds: number;
  finalTotal: number;
  readonly?: boolean;
}

export function SummaryStep({
  name,
  meetingId,
  participants,
  currency,
  hourlyWage,
  finalElapsedSeconds,
  finalTotal,
  readonly = false,
}: SummaryStepProps) {
  const [showAllItems, setShowAllItems] = useState(false);

  const eurRate = CURRENCIES.find((c) => c.code === currency)?.eurRate ?? 1;

  const thingsInCurrency: ThingInCurrency[] = useMemo(() => {
    return THINGS.map((t) => ({
      ...t,
      price: Math.round(t.priceEUR * eurRate * 10) / 10,
    })).sort((a, b) => a.price - b.price);
  }, [eurRate]);

  const unlockedThings = useMemo(() => {
    return thingsInCurrency.filter((t) => finalTotal >= t.price);
  }, [thingsInCurrency, finalTotal]);

  const costPerMinute =
    finalElapsedSeconds > 0 ? (finalTotal / finalElapsedSeconds) * 60 : 0;

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(
        getShareableSummary({
          name,
          participants,
          finalElapsedSeconds,
          finalTotal,
          currency,
        })
      );
      toast.success("Copied to clipboard!");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareableLink(meetingId));
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <Card>
      <CardContent className="p-6 md:p-8">
        <div className="flex items-start justify-between">
          <div className="flex-1 text-center">
            <h2 className="text-3xl font-bold text-foreground">{name}</h2>
            <p className="mt-2 text-muted-foreground">
              Here&apos;s what this meeting cost your organization
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0">
                <Share2 className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleCopyText}>
                <Copy className="mr-2 h-4 w-4" />
                Copy as text
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyLink}>
                <LinkIcon className="mr-2 h-4 w-4" />
                Copy link
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="text-center">
            <div className="text-4xl font-bold text-foreground">
              {formatCurrency(costPerMinute, currency)}
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
                    {showAllItems ?
                      "Show less"
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
          <Button variant="special" asChild>
            <Link href="/">
              {readonly ? "Track your own meeting" : "Track New Meeting"}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
