import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Helper to check role – assumes auth identity has a 'role' field (e.g., 'patient' or 'clinician')
function hasRole(identity: any, role: string): boolean {
  return identity?.tokenIdentifier && identity?.customClaims?.role === role;
}

// Add a new step to a patient's journey (clinician only)
export const addJourneyStep = mutation({
  args: {
    patientId: v.optional(v.id("patients")),
    step: v.object({
      title: v.string(),
      description: v.optional(v.string()),
      order: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || !hasRole(identity, "clinician")) {
      throw new Error("Unauthorized: only clinicians can add steps");
    }
    const targetId = (args.patientId ?? identity?.tokenIdentifier) as any;
    const patient = await ctx.db.get(targetId as any) as any;
    if (!patient) {
      throw new Error("Patient not found");
    }
    const existing = (patient as any).journeySteps ?? [];
    // Use patch to update only journeySteps without needing other required fields
    await ctx.db.patch(targetId as any, {
      journeySteps: [...existing, { ...args.step }],
    });
    return true;
  },
});

// Mark a specific step as completed (clinician only)
export const completeJourneyStep = mutation({
  args: {
    patientId: v.optional(v.id("patients")),
    stepOrder: v.number(),
    completedAt: v.optional(v.string()), // ISO date string, defaults to now if not provided
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || !hasRole(identity, "clinician")) {
      throw new Error("Unauthorized: only clinicians can complete steps");
    }
    const targetId = (args.patientId ?? identity?.tokenIdentifier) as any;
    const patient = await ctx.db.get(targetId as any) as any;

    const patientAny = patient as any;
    if (!patientAny?.journeySteps) return false;
    const updated = patientAny.journeySteps.map((step: any) =>
      step.order === args.stepOrder ? { ...step, completedAt: args.completedAt ?? new Date().toISOString() } : step
    );
    await ctx.db.patch(targetId as any, { journeySteps: updated });
    return true;
  },
});

// Get journey steps for the authenticated patient or for a specific patient if clinician
export const getJourneySteps = query({
  args: {
    patientId: v.optional(v.id("patients")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const isClinician = hasRole(identity, "clinician");
    const targetId = args.patientId ?? identity?.tokenIdentifier; // tokenIdentifier is the patient’s id when role is patient
    const patient: any = await ctx.db.get(targetId as any);
    if (!patient) return [];
    // If patient role, ensure they only read their own record
    if (!isClinician && targetId !== identity?.tokenIdentifier) {
      throw new Error("Unauthorized");
    }
    return (patient as any).journeySteps ?? [];
  },
});
