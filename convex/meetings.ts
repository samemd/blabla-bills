import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Generate a random token for meeting control
function generateToken(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const create = mutation({
  args: {
    name: v.string(),
    participants: v.number(),
    currency: v.string(),
    hourlyWage: v.number(),
  },
  handler: async (ctx, args) => {
    const controlToken = generateToken();
    const now = Date.now();

    const id = await ctx.db.insert("meetings", {
      name: args.name.trim() || "Untitled meeting",
      participants: args.participants,
      currency: args.currency,
      hourlyWage: args.hourlyWage,
      controlToken,
      status: "tracking",
      startedAt: now,
      accumulatedSeconds: 0,
      accumulatedCost: 0,
      costStartedAt: now,
      settingsHistory: [
        {
          timestamp: now,
          participants: args.participants,
          hourlyWage: args.hourlyWage,
        },
      ],
    });

    return { id, controlToken };
  },
});

export const get = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    try {
      // Attempt to normalize the string to a Convex ID
      const normalizedId = ctx.db.normalizeId("meetings", args.id);
      if (!normalizedId) {
        return null;
      }
      return await ctx.db.get(normalizedId);
    } catch {
      return null;
    }
  },
});

export const pause = mutation({
  args: {
    id: v.id("meetings"),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const meeting = await ctx.db.get(args.id);

    if (!meeting || meeting.controlToken !== args.token) {
      return { success: false };
    }

    if (meeting.status !== "tracking") {
      return { success: false };
    }

    const now = Date.now();
    const elapsedSinceStart = Math.floor((now - meeting.startedAt) / 1000);

    // Calculate cost to add for this tracking segment
    const costStartedAt = meeting.costStartedAt ?? meeting.startedAt;
    const costSeconds = Math.floor((now - costStartedAt) / 1000);
    const costPerSecond = (meeting.participants * meeting.hourlyWage) / 3600;
    const segmentCost = Math.max(0, costSeconds) * costPerSecond;

    await ctx.db.patch(args.id, {
      status: "paused",
      pausedAt: now,
      accumulatedSeconds: meeting.accumulatedSeconds + elapsedSinceStart,
      accumulatedCost: (meeting.accumulatedCost ?? 0) + segmentCost,
      costStartedAt: now, // Reset for next segment
    });

    return { success: true };
  },
});

export const resume = mutation({
  args: {
    id: v.id("meetings"),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const meeting = await ctx.db.get(args.id);

    if (!meeting || meeting.controlToken !== args.token) {
      return { success: false };
    }

    if (meeting.status !== "paused") {
      return { success: false };
    }

    const now = Date.now();

    await ctx.db.patch(args.id, {
      status: "tracking",
      startedAt: now,
      costStartedAt: now,
      pausedAt: undefined,
    });

    return { success: true };
  },
});

export const finish = mutation({
  args: {
    id: v.id("meetings"),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const meeting = await ctx.db.get(args.id);

    if (!meeting || meeting.controlToken !== args.token) {
      return { success: false };
    }

    if (meeting.status === "finished") {
      return { success: false };
    }

    const now = Date.now();
    let finalElapsedSeconds = meeting.accumulatedSeconds;
    let finalTotal = meeting.accumulatedCost ?? 0;

    if (meeting.status === "tracking") {
      const elapsedSinceStart = Math.floor((now - meeting.startedAt) / 1000);
      finalElapsedSeconds += elapsedSinceStart;

      // Add cost for current tracking segment
      const costStartedAt = meeting.costStartedAt ?? meeting.startedAt;
      const costSeconds = Math.floor((now - costStartedAt) / 1000);
      const costPerSecond = (meeting.participants * meeting.hourlyWage) / 3600;
      finalTotal += Math.max(0, costSeconds) * costPerSecond;
    }

    await ctx.db.patch(args.id, {
      status: "finished",
      finishedAt: now,
      finalElapsedSeconds,
      finalTotal,
    });

    return { success: true };
  },
});

export const remove = mutation({
  args: {
    id: v.id("meetings"),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const meeting = await ctx.db.get(args.id);

    if (!meeting || meeting.controlToken !== args.token) {
      return { success: false };
    }

    await ctx.db.delete(args.id);

    return { success: true };
  },
});

export const update = mutation({
  args: {
    id: v.id("meetings"),
    token: v.string(),
    participants: v.optional(v.number()),
    hourlyWage: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const meeting = await ctx.db.get(args.id);

    if (!meeting || meeting.controlToken !== args.token) {
      return { success: false };
    }

    // Only allow updates for active meetings (tracking or paused)
    if (meeting.status === "finished") {
      return { success: false };
    }

    const newParticipants =
      args.participants !== undefined && args.participants >= 1
        ? args.participants
        : meeting.participants;
    const newHourlyWage =
      args.hourlyWage !== undefined && args.hourlyWage >= 0
        ? args.hourlyWage
        : meeting.hourlyWage;

    // Check if settings actually changed
    const settingsChanged =
      newParticipants !== meeting.participants ||
      newHourlyWage !== meeting.hourlyWage;

    if (!settingsChanged) {
      return { success: true };
    }

    const now = Date.now();
    const oldCostPerSecond = (meeting.participants * meeting.hourlyWage) / 3600;
    const existingAccumulatedCost = meeting.accumulatedCost ?? 0;
    const costStartedAt = meeting.costStartedAt ?? meeting.startedAt;

    let snapshotCost: number;

    if (meeting.status === "tracking") {
      // Calculate cost for time since costStartedAt at the old rate
      const costSeconds = Math.floor((now - costStartedAt) / 1000);
      snapshotCost =
        existingAccumulatedCost + Math.max(0, costSeconds) * oldCostPerSecond;
    } else {
      // Paused: cost was already accumulated when paused, no new time
      snapshotCost = existingAccumulatedCost;
    }

    await ctx.db.patch(args.id, {
      participants: newParticipants,
      hourlyWage: newHourlyWage,
      accumulatedCost: snapshotCost,
      costStartedAt: now, // New rate starts from now
      settingsHistory: [
        ...(meeting.settingsHistory ?? []),
        {
          timestamp: now,
          participants: newParticipants,
          hourlyWage: newHourlyWage,
        },
      ],
    });

    return { success: true };
  },
});
