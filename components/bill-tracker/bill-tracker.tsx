"use client";

import { CURRENCIES, CurrencyCode } from "@/lib/currency";
import { ThingInCurrency, THINGS } from "@/lib/things";
import { AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatedSection } from "../animations/animated-section";
import { SetupStep } from "./setup-step";
import { SummaryStep } from "./summary-step";
import { TrackingStep } from "./tracking-step";

type Step = "setup" | "track" | "summary";

export function BillTracker() {
  const [step, setStep] = useState<Step>("setup");
  const [participants, setParticipants] = useState<number>(5);
  const [currency, setCurrency] = useState<CurrencyCode>("CHF");
  const [hourlyWage, setHourlyWage] = useState<number>(150);

  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [finalElapsedSeconds, setFinalElapsedSeconds] = useState<number>(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(0);

  const costPerSecond = (participants * hourlyWage) / 3600;
  const rawTotal = elapsedSeconds * costPerSecond;
  const finalTotal = finalElapsedSeconds * costPerSecond;

  const eurRate = CURRENCIES.find((c) => c.code === currency)?.eurRate ?? 1;

  const thingsInCurrency: ThingInCurrency[] = THINGS.map((t) => ({
    ...t,
    price: Math.round(t.priceEUR * eurRate * 10) / 10,
  })).sort((a, b) => a.price - b.price);

  const unlockedThings = useMemo(() => {
    const total = step === "summary" ? finalTotal : rawTotal;
    return thingsInCurrency.filter((t) => total >= t.price);
  }, [thingsInCurrency, rawTotal, finalTotal, step]);

  // Timer logic
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
    }, 100);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  // Handle pause/resume
  useEffect(() => {
    if (!isRunning && startTimeRef.current !== null) {
      pausedTimeRef.current = elapsedSeconds;
      startTimeRef.current = null;
    } else if (isRunning && startTimeRef.current === null) {
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
      {step === "setup" && (
        <AnimatedSection key="setup">
          <SetupStep
            participants={participants}
            setParticipants={setParticipants}
            currency={currency}
            setCurrency={setCurrency}
            hourlyWage={hourlyWage}
            setHourlyWage={setHourlyWage}
            onStart={handleStart}
          />
        </AnimatedSection>
      )}

      {step === "track" && (
        <AnimatedSection key="track">
          <TrackingStep
            participants={participants}
            currency={currency}
            hourlyWage={hourlyWage}
            isRunning={isRunning}
            elapsedSeconds={elapsedSeconds}
            rawTotal={rawTotal}
            thingsInCurrency={thingsInCurrency}
            unlockedThings={unlockedThings}
            onPauseResume={() => setIsRunning((r) => !r)}
            onStop={handleStop}
            onFinish={handleFinish}
          />
        </AnimatedSection>
      )}

      {step === "summary" && (
        <AnimatedSection key="summary">
          <SummaryStep
            participants={participants}
            currency={currency}
            hourlyWage={hourlyWage}
            finalElapsedSeconds={finalElapsedSeconds}
            finalTotal={finalTotal}
            unlockedThings={unlockedThings}
            onNewMeeting={handleNewMeeting}
          />
        </AnimatedSection>
      )}
    </AnimatePresence>
  );
}
