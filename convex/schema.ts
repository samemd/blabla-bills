import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  meetings: defineTable({
    name: v.string(),
    participants: v.number(),
    currency: v.string(),
    hourlyWage: v.number(),
    controlToken: v.string(),
    status: v.union(
      v.literal("tracking"),
      v.literal("paused"),
      v.literal("finished"),
    ),
    startedAt: v.number(),
    accumulatedSeconds: v.number(),
    pausedAt: v.optional(v.number()),
    finishedAt: v.optional(v.number()),
    finalElapsedSeconds: v.optional(v.number()),
    finalTotal: v.optional(v.number()),
  }),
});
