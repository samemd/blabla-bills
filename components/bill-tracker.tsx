"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CURRENCIES, CurrencyCode, formatCurrency } from "@/lib/currency";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { NextMilestone } from "@/components/next-milestone";
import { Milestones } from "@/components/milestones";
import { useEffect, useMemo, useRef, useState } from "react";
import { ThingInCurrency, THINGS } from "@/lib/things";
import { useAnimatedNumber } from "@/hooks/use-animated-number";

export function BillTracker() {
  const [step, setStep] = useState<"setup" | "track">("setup");
  const [participants, setParticipants] = useState<number>(5);
  const [currency, setCurrency] = useState<CurrencyCode>("CHF");
  const [hourlyWage, setHourlyWage] = useState<number>(50);

  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const costPerSecond = useMemo(() => {
    // participants * hourlyWage per hour -> per second
    return (participants * hourlyWage) / 3600;
  }, [participants, hourlyWage]);

  const rawTotal = elapsedSeconds * costPerSecond;
  const animatedTotal = useAnimatedNumber(rawTotal, 0.85);

  // Timeline conversion helpers
  const eurRate = CURRENCIES.find((c) => c.code === currency)?.eurRate ?? 1; // EUR -> currency

  const thingsInCurrency: ThingInCurrency[] = useMemo(() => {
    return THINGS.map((t) => ({
      ...t,
      price: t.priceEUR * eurRate,
    })).sort((a, b) => a.price - b.price);
  }, [eurRate]);

  // Tick every second
  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  function handleStart() {
    setStep("track");
    setIsRunning(true);
    setElapsedSeconds(0);
  }

  function handleStop() {
    setIsRunning(false);
    setStep("setup");
    setElapsedSeconds(0);
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
                          Math.max(1, Number(e.target.value) || 1),
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
                    <SelectTrigger className="w-full">
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
                    <div className="text-sm text-foreground">
                      {formatCurrency(hourlyWage, currency, 0, 0)}/h
                    </div>
                  </div>
                </div>
                <Slider
                  value={[hourlyWage]}
                  min={0}
                  max={300}
                  step={1}
                  onValueChange={([v]) => setHourlyWage(v)}
                />
                <div className="flex justify-between text-xs text-subtle">
                  <span>0</span>
                  <span>{formatCurrency(150, currency, 0, 0)} (typical)</span>
                  <span>{formatCurrency(300, currency, 0, 0)}</span>
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <Button
                  size="lg"
                  className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-fuchsia-500 text-white"
                  onClick={handleStart}
                >
                  <span className="relative z-10">Start Tracking</span>
                  <span className="absolute inset-0 -z-0 translate-y-[120%] bg-white/20 transition-transform duration-500 group-hover:translate-y-0" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      ) : (
        <motion.section
          key="track"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="mx-auto max-w-4xl"
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

                  <div className="mt-4 text-5xl font-extrabold tracking-tight text-foreground md:text-6xl">
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

                  <div className="mt-6 flex gap-3">
                    <Button
                      variant="secondary"
                      onClick={() => setIsRunning((r) => !r)}
                    >
                      {isRunning ? "Pause" : "Resume"}
                    </Button>
                    <Button variant="destructive" onClick={handleStop}>
                      Stop & reset
                    </Button>
                  </div>
                </div>

                {/* Next milestone */}
                <NextMilestone
                  things={thingsInCurrency}
                  total={rawTotal}
                  currency={currency}
                />
              </div>
              <Milestones
                things={thingsInCurrency}
                total={rawTotal}
                currency={currency}
              />
            </CardContent>
          </Card>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
