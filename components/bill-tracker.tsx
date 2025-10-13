"use client";

import { Milestone } from "@/components/milestone/milestone";
import { MilestoneList } from "@/components/milestone/milestone-list";
import { NextMilestone } from "@/components/milestone/next-milestone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  InputBase,
  InputBaseAdornment,
  InputBaseControl,
  InputBaseInput,
} from "@/components/ui/input-base";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { useAnimatedNumber } from "@/hooks/use-animated-number";
import { CURRENCIES, CurrencyCode, formatCurrency } from "@/lib/currency";
import { ThingInCurrency, THINGS } from "@/lib/things";
import { formatDuration } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

export function BillTracker() {
  const [step, setStep] = useState<"setup" | "track" | "summary">("setup");
  const [participants, setParticipants] = useState<number>(5);
  const [currency, setCurrency] = useState<CurrencyCode>("CHF");
  const [hourlyWage, setHourlyWage] = useState<number>(150);

  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [finalElapsedSeconds, setFinalElapsedSeconds] = useState<number>(0);
  const [showAllItems, setShowAllItems] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(0);

  const costPerSecond = (participants * hourlyWage) / 3600;

  const rawTotal = elapsedSeconds * costPerSecond;
  const finalTotal = finalElapsedSeconds * costPerSecond;
  const animatedTotal = useAnimatedNumber(rawTotal, 0.85);

  const eurRate = CURRENCIES.find((c) => c.code === currency)?.eurRate ?? 1;

  const thingsInCurrency: ThingInCurrency[] = useMemo(() => {
    return THINGS.map((t) => ({
      ...t,
      price: t.priceEUR * eurRate,
    })).sort((a, b) => a.price - b.price);
  }, [eurRate]);

  const unlockedThings = useMemo(() => {
    const total = step === "summary" ? finalTotal : rawTotal;
    return thingsInCurrency.filter((t) => total >= t.price);
  }, [thingsInCurrency, rawTotal, finalTotal, step]);

  const symbol = CURRENCIES.find((c) => c.code === currency)?.symbol ?? "CHF";

  // Tick based on actual elapsed time
  useEffect(() => {
    if (!isRunning) return;

    if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
    }

    intervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const elapsed = Math.floor(
          (Date.now() - startTimeRef.current) / 1000 + pausedTimeRef.current
        );
        setElapsedSeconds(elapsed);
      }
    }, 100); // Update more frequently for smoother display

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  // Handle pause/resume
  useEffect(() => {
    if (!isRunning && startTimeRef.current !== null) {
      // Paused
      pausedTimeRef.current = elapsedSeconds;
      startTimeRef.current = null;
    } else if (isRunning && startTimeRef.current === null) {
      // Resumed
      startTimeRef.current = Date.now();
    }
  }, [isRunning, elapsedSeconds]);

  function handleStart() {
    setStep("track");
    setIsRunning(true);
    setElapsedSeconds(0);
    startTimeRef.current = Date.now();
    pausedTimeRef.current = 0;
  }

  function handleStop() {
    setIsRunning(false);
    setStep("setup");
    setElapsedSeconds(0);
    startTimeRef.current = null;
    pausedTimeRef.current = 0;
  }

  function handleFinish() {
    setIsRunning(false);
    setFinalElapsedSeconds(elapsedSeconds);
    setStep("summary");
    startTimeRef.current = null;
    pausedTimeRef.current = 0;
  }

  function handleNewMeeting() {
    setStep("setup");
    setElapsedSeconds(0);
    setFinalElapsedSeconds(0);
    setIsRunning(false);
    startTimeRef.current = null;
    pausedTimeRef.current = 0;
  }

  return (
    <AnimatePresence initial={false} mode="wait">
      {step === "setup" ? (
        <motion.section
          key="setup"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="mx-auto max-w-3xl"
        >
          <Card>
            <CardContent className="p-6 md:p-8">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Participants */}
                <div className="space-y-3">
                  <Label htmlFor="participants">Participants</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setParticipants((p) => Math.max(1, p - 1))}
                      aria-label="Decrease participants"
                    >
                      −
                    </Button>
                    <Input
                      id="participants"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      value={participants}
                      onChange={(e) =>
                        setParticipants(
                          Math.max(1, Number(e.target.value) || 1)
                        )
                      }
                      className="text-center"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setParticipants((p) => p + 1)}
                      aria-label="Increase participants"
                    >
                      +
                    </Button>
                  </div>
                  <p className="text-sm text-subtle">
                    Include everyone in the room or call.
                  </p>
                </div>

                {/* Currency */}
                <div className="space-y-3">
                  <Label>Currency</Label>
                  <Select
                    value={currency}
                    onValueChange={(val) => setCurrency(val as CurrencyCode)}
                  >
                    <SelectTrigger className="w-full" aria-label="Currency">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-subtle">
                    Display currency for wages and totals.
                  </p>
                </div>
              </div>

              <Separator className="my-6 dark:bg-slate-800" />

              {/* Hourly wage */}
              <div className="grid gap-3">
                <div className="flex items-end justify-between gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="wage">Average hourly wage per person</Label>
                    <p className="text-sm text-subtle">
                      A rough average is enough.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <InputBase>
                      <InputBaseAdornment>{symbol}</InputBaseAdornment>
                      <InputBaseControl>
                        <InputBaseInput
                          id="wage"
                          type="number"
                          inputMode="decimal"
                          min={0}
                          step="1"
                          max={300}
                          value={hourlyWage}
                          onChange={(e) =>
                            setHourlyWage(Math.max(0, +e.target.value || 0))
                          }
                          className="w-20 text-end"
                        />
                      </InputBaseControl>
                    </InputBase>
                  </div>
                </div>
                <Slider
                  value={[hourlyWage]}
                  min={0}
                  max={300}
                  step={1}
                  onValueChange={([v]) => setHourlyWage(v)}
                  aria-label="Hourly wage slider"
                />
                <div className="flex justify-between text-xs text-subtle">
                  <span>0</span>
                  <span>{formatCurrency(150, currency, 0, 0)} (typical)</span>
                  <span>{formatCurrency(300, currency, 0, 0)}</span>
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <Button size="lg" variant="special" onClick={handleStart}>
                  Start Tracking
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      ) : step === "track" ? (
        <motion.section
          key="track"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="mx-auto max-w-3xl"
        >
          <Card className="border-slate-200/70 bg-white/70 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/70">
            <CardContent className="p-6 md:p-8">
              <div className="grid gap-6 md:grid-cols-[1.3fr_1fr]">
                {/* Live total */}
                <div className="relative overflow-hidden rounded-lg border bg-white/60 p-6 dark:border-slate-800 dark:bg-slate-900/60">
                  <div className="absolute inset-0 -z-10 bg-[radial-gradient(600px_200px_at_50%_-20%,rgba(59,130,246,0.15),transparent)] dark:bg-[radial-gradient(600px_200px_at_50%_-20%,rgba(59,130,246,0.25),transparent)]" />
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-muted-foreground">
                      Running total
                    </div>
                  </div>

                  <div className="tabular-nums mt-4 text-5xl font-extrabold tracking-tight text-foreground md:text-6xl">
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

                  <div className="mt-6 grid sm:flex gap-3">
                    <Button
                      variant="secondary"
                      onClick={() => setIsRunning((r) => !r)}
                    >
                      {isRunning ? "Pause" : "Resume"}
                    </Button>
                    <Button variant="destructive" onClick={handleStop}>
                      Stop & reset
                    </Button>
                    <Button onClick={handleFinish}>Finish</Button>
                  </div>
                </div>

                <NextMilestone
                  things={thingsInCurrency}
                  total={rawTotal}
                  currency={currency}
                />
              </div>
              <MilestoneList things={unlockedThings} currency={currency} />
            </CardContent>
          </Card>
        </motion.section>
      ) : (
        <motion.section
          key="summary"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="mx-auto max-w-3xl"
        >
          <Card>
            <CardContent className="p-6 md:p-8">
              {/* Header */}
              <div className="text-center">
                <h2 className="text-3xl font-bold text-foreground">
                  Meeting Summary
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Here&apos;s what this meeting cost your organization
                </p>
              </div>

              <div className="mt-8 grid gap-6 md:grid-cols-3">
                {/* Cost per minute */}
                <div className="text-center">
                  <div className="text-4xl font-bold text-foreground">
                    {formatCurrency(
                      finalElapsedSeconds > 0
                        ? (finalTotal / finalElapsedSeconds) * 60
                        : 0,
                      currency
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Cost per minute
                  </p>
                </div>

                {/* Duration */}
                <div className="text-center">
                  <div className="text-4xl font-bold text-foreground">
                    {formatDuration(finalElapsedSeconds)}
                  </div>
                  <p className="text-sm text-muted-foreground">Time wasted</p>
                </div>

                {/* Total Cost */}
                <div className="text-center">
                  <div className="text-4xl font-bold text-foreground">
                    {formatCurrency(finalTotal, currency)}
                  </div>
                  <p className="text-sm text-muted-foreground">Money wasted</p>
                </div>
              </div>

              <Separator className="my-8" />

              {/* Meeting Details */}
              <div className="grid gap-4 sm:grid-cols-2 justify-items-center">
                <div className="text-center sm:text-start">
                  <h3 className="font-semibold text-foreground">
                    Meeting Details
                  </h3>
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <div>{participants} participants</div>
                    <div>
                      {formatCurrency(hourlyWage, currency, 0, 0)} average
                      hourly rate
                    </div>
                    <div>
                      {formatCurrency(
                        (participants * hourlyWage) / 60,
                        currency
                      )}{" "}
                      cost per minute
                    </div>
                  </div>
                </div>

                <div className="text-center sm:text-start">
                  <h3 className="font-semibold text-foreground">
                    Time Investment
                  </h3>
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <div>
                      {((finalElapsedSeconds * participants) / 60).toFixed(1)}{" "}
                      total person-minutes
                    </div>
                    <div>
                      {((finalElapsedSeconds * participants) / 3600).toFixed(1)}{" "}
                      total person-hours
                    </div>
                    <div>
                      {(
                        (finalElapsedSeconds * participants) /
                        (8 * 3600)
                      ).toFixed(2)}{" "}
                      person-days
                      {(finalElapsedSeconds * participants) / (8 * 3600) >= 1
                        ? " 🤯"
                        : ""}
                    </div>
                  </div>
                </div>
              </div>

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
                          {showAllItems ? (
                            <>
                              Show less
                              <svg
                                className="ml-1 h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 15l7-7 7 7"
                                />
                              </svg>
                            </>
                          ) : (
                            <>
                              Show all {unlockedThings.length}
                              <svg
                                className="ml-1 h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </>
                          )}
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
                                .slice(0, -1) // Exclude the most expensive item
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

              {/* Actions */}
              <div className="mt-8 flex justify-center gap-3">
                <Button onClick={handleNewMeeting} variant="special">
                  Track New Meeting
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
