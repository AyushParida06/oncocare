import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
export const list = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("chemoSessions").order("desc").take(100);
    },
});
export const create = mutation({
    args: {
        patientId: v.id("patients"),
        protocol: v.string(),
        cycleNumber: v.number(),
        scheduledDate: v.string(),
        status: v.string(),
        notes: v.string(),
        drugs: v.array(v.object({
            name: v.string(),
            dose: v.string(),
            route: v.string(),
        })),
    },
    handler: async (ctx, args) => {
        const patient = await ctx.db.get(args.patientId);
        if (!patient) {
            throw new Error("Patient not found");
        }
        return await ctx.db.insert("chemoSessions", args);
    },
});
export const updateStatus = mutation({
    args: {
        id: v.id("chemoSessions"),
        status: v.string(),
    },
    handler: async (ctx, args) => {
        const session = await ctx.db.get(args.id);
        if (!session) {
            throw new Error("Chemo session not found");
        }
        await ctx.db.patch(args.id, { status: args.status });
        return args.id;
    },
});
export const todayCount = query({
    args: {},
    handler: async (ctx) => {
        const today = new Date().toISOString().split("T")[0];
        const todaySessions = await ctx.db
            .query("chemoSessions")
            .withIndex("by_date", (q) => q.eq("scheduledDate", today))
            .collect();
        return {
            total: todaySessions.length,
            pending: todaySessions.filter((s) => s.status === "scheduled" || s.status === "in-progress").length,
        };
    },
});
