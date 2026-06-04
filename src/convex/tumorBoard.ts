import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getMeetings = query({
  handler: async (ctx) => {
    return await ctx.db.query("tumourBoardMeetings").order("desc").collect();
  },
});

export const addMeeting = mutation({
  args: {
    date: v.string(),
    location: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("tumourBoardMeetings", {
      ...args,
    });
  },
});

export const getCases = query({
  args: { meetingId: v.id("tumourBoardMeetings") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tumourBoardCases")
      .filter((q) => q.eq(q.field("meetingId"), args.meetingId))
      .collect();
  },
});

export const addCase = mutation({
  args: {
    meetingId: v.id("tumourBoardMeetings"),
    patientId: v.id("patients"),
    summary: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("tumourBoardCases", {
      ...args,
    });
  },
});

export const updateCaseDecision = mutation({
  args: {
    caseId: v.id("tumourBoardCases"),
    decision: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.caseId, { decision: args.decision });
  },
});
