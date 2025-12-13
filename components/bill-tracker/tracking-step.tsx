"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { MilestoneList } from "@/components/milestone/milestone-list";
import { NextMilestone } from "@/components/milestone/next-milestone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CURRENCIES, CurrencyCode } from "@/lib/currency";
import { ThingInCurrency, THINGS } from "@/lib/things";
import { getShareableLink } from "@/lib/utils";
import { useMutation } from "convex/react";
import { Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { LiveTotal } from "./live-total";

interface TrackingStepProps {
  name: string;
  meetingId: Id<"meetings">;
  participants: number;
  currency: CurrencyCode;
  hourlyWage: number;
  status: "tracking" | "paused";
  startedAt: number;
  accumulatedSeconds: number;
  readonly?: boolean;
  controlToken?: string;
}

export function TrackingStep({
  name,
  meetingId,
  participants,
  currency,
  hourlyWage,
  status,
  startedAt,
  accumulatedSeconds,
  readonly = false,
  controlToken,
}: TrackingStepProps) {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  // Convex mutations
  const pauseMeeting = useMutation(api.meetings.pause);
  const resumeMeeting = useMutation(api.meetings.resume);
  const finishMeeting = useMutation(api.meetings.finish);
  const removeMeeting = useMutation(api.meetings.remove);

  // Set up interval to update current time when tracking
  useEffect(() => {
    if (status === "paused") {
      return;
    }

    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [status]);

  // Calculate elapsed time based on status
  const elapsedSeconds = useMemo(() => {
    if (status === "paused") {
      return accumulatedSeconds;
    }

    const elapsedSinceStart = Math.floor((currentTime - startedAt) / 1000);
    return accumulatedSeconds + Math.max(0, elapsedSinceStart);
  }, [status, startedAt, accumulatedSeconds, currentTime]);

  const costPerSecond = (participants * hourlyWage) / 3600;
  const rawTotal = elapsedSeconds * costPerSecond;

  const eurRate = CURRENCIES.find((c) => c.code === currency)?.eurRate ?? 1;

  const thingsInCurrency: ThingInCurrency[] = useMemo(() => {
    return THINGS.map((t) => ({
      ...t,
      price: Math.round(t.priceEUR * eurRate * 10) / 10,
    })).sort((a, b) => a.price - b.price);
  }, [eurRate]);

  const unlockedThings = useMemo(() => {
    return thingsInCurrency.filter((t) => rawTotal >= t.price);
  }, [thingsInCurrency, rawTotal]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareableLink(meetingId));
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handlePauseResume = async () => {
    if (!controlToken) return;

    if (status === "tracking") {
      const result = await pauseMeeting({ id: meetingId, token: controlToken });
      if (!result.success) {
        toast.error("Failed to pause meeting");
      }
    } else {
      const result = await resumeMeeting({
        id: meetingId,
        token: controlToken,
      });
      if (!result.success) {
        toast.error("Failed to resume meeting");
      }
    }
  };

  const handleStop = async () => {
    if (!controlToken) return;

    const result = await removeMeeting({ id: meetingId, token: controlToken });
    if (result.success) {
      router.push("/");
    } else {
      toast.error("Failed to stop meeting");
    }
  };

  const handleFinish = async () => {
    if (!controlToken) return;

    const result = await finishMeeting({ id: meetingId, token: controlToken });
    if (!result.success) {
      toast.error("Failed to finish meeting");
    }
  };

  return (
    <Card className="border-slate-200/70 bg-white/70 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/70">
      <CardContent className="px-6 md:px-8">
        <div className="relative mb-6 flex items-start justify-center">
          <div className="flex flex-col items-center">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700 dark:bg-green-500/10 dark:text-green-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
              {status === "tracking" ? "Meeting in progress" : "Meeting paused"}
            </div>
            <h1 className="text-2xl font-bold text-foreground">{name}</h1>
          </div>
          {!readonly && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyLink}
              className="absolute right-0 top-0"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-[1.3fr_1fr]">
          <LiveTotal
            participants={participants}
            currency={currency}
            hourlyWage={hourlyWage}
            elapsedSeconds={elapsedSeconds}
            total={rawTotal}
            readonly={readonly}
            status={status}
            onPauseResume={handlePauseResume}
            onStop={handleStop}
            onFinish={handleFinish}
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
