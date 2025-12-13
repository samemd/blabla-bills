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

    const id = await ctx.db.insert("meetings", {
      name: args.name.trim() || "Untitled meeting",
      participants: args.participants,
      currency: args.currency,
      hourlyWage: args.hourlyWage,
      controlToken,
      status: "tracking",
      startedAt: Date.now(),
      accumulatedSeconds: 0,
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

    // Calculate elapsed time since last startedAt
    const now = Date.now();
    const elapsedSinceStart = Math.floor((now - meeting.startedAt) / 1000);

    await ctx.db.patch(args.id, {
      status: "paused",
      pausedAt: now,
      accumulatedSeconds: meeting.accumulatedSeconds + elapsedSinceStart,
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

    await ctx.db.patch(args.id, {
      status: "tracking",
      startedAt: Date.now(),
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

    // Calculate final elapsed time
    let finalElapsedSeconds = meeting.accumulatedSeconds;

    if (meeting.status === "tracking") {
      const now = Date.now();
      const elapsedSinceStart = Math.floor((now - meeting.startedAt) / 1000);
      finalElapsedSeconds += elapsedSinceStart;
    }

    const costPerSecond = (meeting.participants * meeting.hourlyWage) / 3600;
    const finalTotal = finalElapsedSeconds * costPerSecond;

    await ctx.db.patch(args.id, {
      status: "finished",
      finishedAt: Date.now(),
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
