export async function getStats(ctx) {
    const existing = await ctx.db
        .query("stats")
        .withIndex("by_key", (q) => q.eq("key", "dashboard"))
        .unique();
    if (existing) {
        return existing;
    }
    // Return fallback defaults instead of inserting during a read-only query
    return {
        totalPatients: 0,
        activePatients: 0,
        remissionPatients: 0,
        byType: {},
        todayAppointments: 0,
        confirmedTodayAppointments: 0,
        todayChemoSessions: 0,
        pendingTodayChemoSessions: 0,
        activeAdmissionsCount: 0,
    };
}
export async function updatePatientStats(ctx, diff) {
    let stats = await ctx.db
        .query("stats")
        .withIndex("by_key", (q) => q.eq("key", "dashboard"))
        .unique();
    if (!stats) {
        const id = await ctx.db.insert("stats", {
            key: "dashboard",
            totalPatients: 0,
            activePatients: 0,
            remissionPatients: 0,
            byType: {},
            todayAppointments: 0,
            confirmedTodayAppointments: 0,
            todayChemoSessions: 0,
            pendingTodayChemoSessions: 0,
            activeAdmissionsCount: 0,
        });
        const created = await ctx.db.get(id);
        stats = created;
    }
    const byType = { ...stats.byType };
    if (diff.typeChange) {
        if (diff.typeChange.oldType) {
            byType[diff.typeChange.oldType] = Math.max(0, (byType[diff.typeChange.oldType] || 0) - 1);
            if (byType[diff.typeChange.oldType] === 0) {
                delete byType[diff.typeChange.oldType];
            }
        }
        if (diff.typeChange.newType) {
            byType[diff.typeChange.newType] = (byType[diff.typeChange.newType] || 0) + 1;
        }
    }
    await ctx.db.patch(stats._id, {
        totalPatients: Math.max(0, stats.totalPatients + (diff.total || 0)),
        activePatients: Math.max(0, stats.activePatients + (diff.active || 0)),
        remissionPatients: Math.max(0, stats.remissionPatients + (diff.remission || 0)),
        byType,
        activeAdmissionsCount: Math.max(0, stats.activeAdmissionsCount + (diff.admissions || 0)),
    });
}
