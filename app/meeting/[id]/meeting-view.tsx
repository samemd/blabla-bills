"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { CurrencyCode } from "@/lib/currency";
import { useQuery } from "convex/react";
import Link from "next/link";
import { SummaryStep } from "@/components/bill-tracker/summary-step";
import { TrackingStep } from "@/components/bill-tracker/tracking-step";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface MeetingViewProps {
  meetingId: Id<"meetings">;
  token?: string;
}

export function MeetingView({ meetingId, token }: MeetingViewProps) {
  const meeting = useQuery(api.meetings.get, { id: meetingId });

  // Loading state
  if (meeting === undefined) {
    return (
      <Card className="border-slate-200/70 bg-white/70 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/70">
        <CardContent className="flex min-h-[400px] items-center justify-center px-6 md:px-8">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-500" />
            <p className="text-muted-foreground">Loading meeting...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Meeting not found
  if (meeting === null) {
    return (
      <Card className="border-slate-200/70 bg-white/70 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/70">
        <CardContent className="flex min-h-[300px] flex-col items-center justify-center gap-4 px-6 md:px-8">
          <h2 className="text-2xl font-bold text-foreground">
            Meeting not found
          </h2>
          <p className="text-muted-foreground mb-4">
            This meeting may have been deleted or the link is invalid.
          </p>
          <Button variant="special" asChild>
            <Link href="/">Track your own meeting</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Check if the token matches - if so, user has control
  const hasControl = token === meeting.controlToken;
  const readonly = !hasControl;

  if (meeting.status === "finished") {
    return (
      <SummaryStep
        name={meeting.name}
        meetingId={meetingId}
        participants={meeting.participants}
        currency={meeting.currency as CurrencyCode}
        hourlyWage={meeting.hourlyWage}
        finalElapsedSeconds={meeting.finalElapsedSeconds ?? 0}
        finalTotal={meeting.finalTotal ?? 0}
        readonly={readonly}
      />
    );
  }

  return (
    <TrackingStep
      name={meeting.name}
      meetingId={meetingId}
      participants={meeting.participants}
      currency={meeting.currency as CurrencyCode}
      hourlyWage={meeting.hourlyWage}
      status={meeting.status}
      startedAt={meeting.startedAt}
      accumulatedSeconds={meeting.accumulatedSeconds}
      readonly={readonly}
      controlToken={hasControl ? token : undefined}
    />
  );
}
