"use client";

import { createMeetingAction } from "@/app/actions/meetings";
import { CurrencyCode } from "@/lib/currency";
import { generateName } from "@/lib/name-generator";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SetupStep } from "./setup-step";

export function BillTracker() {
  const router = useRouter();
  const [name, setName] = useState<string>("");
  const [participants, setParticipants] = useState<number>(5);
  const [currency, setCurrency] = useState<CurrencyCode>("CHF");
  const [hourlyWage, setHourlyWage] = useState<number>(150);

  async function handleStart() {
    // Auto-generate name if empty
    const meetingName = name.trim() || generateName();

    // Save meeting to Upstash
    const { id, controlToken } = await createMeetingAction({
      name: meetingName,
      participants,
      currency,
      hourlyWage,
    });

    // Redirect to meeting page with control token
    router.push(`/meeting/${id}?token=${controlToken}`);
  }

  return (
    <SetupStep
      name={name}
      setName={setName}
      participants={participants}
      setParticipants={setParticipants}
      currency={currency}
      setCurrency={setCurrency}
      hourlyWage={hourlyWage}
      setHourlyWage={setHourlyWage}
      onStart={handleStart}
    />
  );
}
