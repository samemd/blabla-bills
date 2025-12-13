"use server";

import { CurrencyCode } from "@/lib/currency";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export interface Meeting {
  id: string;
  name: string;
  participants: number;
  currency: CurrencyCode;
  hourlyWage: number;
  controlToken: string;
  status: "tracking" | "paused" | "finished";
  startedAt: string;
  pausedAt?: string;
  accumulatedSeconds: number;
  finishedAt?: string;
  finalElapsedSeconds?: number;
  finalTotal?: number;
}

export async function createMeetingAction(data: {
  name: string;
  participants: number;
  currency: CurrencyCode;
  hourlyWage: number;
}): Promise<{ id: string; controlToken: string }> {
  const id = crypto.randomUUID();
  const controlToken = crypto.randomUUID();

  const meeting: Meeting = {
    id,
    name: data.name.trim() || "Untitled meeting",
    participants: data.participants,
    currency: data.currency,
    hourlyWage: data.hourlyWage,
    controlToken,
    status: "tracking",
    startedAt: new Date().toISOString(),
    accumulatedSeconds: 0,
  };

  await redis.set(`meeting:${id}`, meeting);

  return { id, controlToken };
}

export async function pauseMeetingAction(
  id: string,
  token: string,
): Promise<{ success: boolean }> {
  const meeting = await redis.get<Meeting>(`meeting:${id}`);

  if (!meeting || meeting.controlToken !== token) {
    return { success: false };
  }

  if (meeting.status !== "tracking") {
    return { success: false };
  }

  // Calculate elapsed time since last startedAt
  const now = Date.now();
  const startTime = new Date(meeting.startedAt).getTime();
  const elapsedSinceStart = Math.floor((now - startTime) / 1000);

  const updatedMeeting: Meeting = {
    ...meeting,
    status: "paused",
    pausedAt: new Date().toISOString(),
    accumulatedSeconds: meeting.accumulatedSeconds + elapsedSinceStart,
  };

  await redis.set(`meeting:${id}`, updatedMeeting);

  return { success: true };
}

export async function resumeMeetingAction(
  id: string,
  token: string,
): Promise<{ success: boolean }> {
  const meeting = await redis.get<Meeting>(`meeting:${id}`);

  if (!meeting || meeting.controlToken !== token) {
    return { success: false };
  }

  if (meeting.status !== "paused") {
    return { success: false };
  }

  const updatedMeeting: Meeting = {
    ...meeting,
    status: "tracking",
    startedAt: new Date().toISOString(),
    pausedAt: undefined,
  };

  await redis.set(`meeting:${id}`, updatedMeeting);

  return { success: true };
}

export async function finishMeetingAction(
  id: string,
  token: string,
): Promise<{ success: boolean }> {
  const meeting = await redis.get<Meeting>(`meeting:${id}`);

  if (!meeting || meeting.controlToken !== token) {
    return { success: false };
  }

  if (meeting.status === "finished") {
    return { success: false };
  }

  // Calculate final elapsed time
  let finalElapsedSeconds = meeting.accumulatedSeconds;

  if (meeting.status === "tracking") {
    const now = Date.now();
    const startTime = new Date(meeting.startedAt).getTime();
    const elapsedSinceStart = Math.floor((now - startTime) / 1000);
    finalElapsedSeconds += elapsedSinceStart;
  }

  const costPerSecond = (meeting.participants * meeting.hourlyWage) / 3600;
  const finalTotal = finalElapsedSeconds * costPerSecond;

  const updatedMeeting: Meeting = {
    ...meeting,
    status: "finished",
    finishedAt: new Date().toISOString(),
    finalElapsedSeconds,
    finalTotal,
  };

  await redis.set(`meeting:${id}`, updatedMeeting);

  return { success: true };
}

export async function deleteMeetingAction(
  id: string,
  token: string,
): Promise<{ success: boolean }> {
  const meeting = await redis.get<Meeting>(`meeting:${id}`);

  if (!meeting || meeting.controlToken !== token) {
    return { success: false };
  }

  await redis.del(`meeting:${id}`);

  return { success: true };
}

export async function getMeetingAction(id: string): Promise<Meeting | null> {
  const meeting = await redis.get<Meeting>(`meeting:${id}`);
  return meeting;
}
