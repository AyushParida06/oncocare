import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getStats } from "./statsHelper";
export const listLabs = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("labs").order("desc").take(100);
    },
});
export const createLab = mutation({
    args: {
        patientId: v.id("patients"),
        testName: v.string(),
        orderedBy: v.string(),
        orderedDate: v.string(),
        status: v.string(),
        notes: v.string(),
    },
    handler: async (ctx, args) => {
        const patient = await ctx.db.get(args.patientId);
        if (!patient) {
            throw new Error("Patient not found");
        }
        return await ctx.db.insert("labs", args);
    },
});
export const activeAdmissionsCount = query({
    args: {},
    handler: async (ctx) => {
        const s = await getStats(ctx);
        return s.activeAdmissionsCount;
    },
});
