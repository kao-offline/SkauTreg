import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authError, requireTroopEditor, requireTroopViewer } from "./lib/auth";

const attendanceStatus = v.union(
  v.literal("present"),
  v.literal("absent"),
  v.literal("excused"),
  v.literal("unmarked"),
);

function validateMeetingDate(meetingDate: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(meetingDate)) {
    authError("VALIDATION_ERROR", "Datum schůzky musí být ve formátu RRRR-MM-DD.");
  }

  const parsed = new Date(`${meetingDate}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== meetingDate) {
    authError("VALIDATION_ERROR", "Zadané datum schůzky není platné.");
  }
}

export const getForDate = query({
  args: {
    troopId: v.id("troops"),
    meetingDate: v.string(),
  },
  handler: async (ctx, args) => {
    await requireTroopViewer(ctx, args.troopId);
    validateMeetingDate(args.meetingDate);

    const [members, records] = await Promise.all([
      ctx.db
        .query("members")
        .withIndex("by_troop", (q) => q.eq("troopId", args.troopId))
        .collect(),
      ctx.db
        .query("attendance")
        .withIndex("by_troop_date", (q) =>
          q.eq("troopId", args.troopId).eq("meetingDate", args.meetingDate),
        )
        .collect(),
    ]);

    const recordsByMember = new Map(records.map((record) => [record.memberId, record]));

    return members
      .sort((a, b) => a.name.localeCompare(b.name, "cs"))
      .map((member) => {
        const record = recordsByMember.get(member._id);
        return {
          memberId: member._id,
          name: member.name,
          nickname: member.nickname,
          status: record?.status ?? "unmarked" as const,
          updatedAt: record?.updatedAt,
        };
      });
  },
});

export const setStatus = mutation({
  args: {
    troopId: v.id("troops"),
    memberId: v.id("members"),
    meetingDate: v.string(),
    status: attendanceStatus,
  },
  handler: async (ctx, args) => {
    const { user } = await requireTroopEditor(ctx, args.troopId);
    validateMeetingDate(args.meetingDate);

    const member = await ctx.db.get(args.memberId);
    if (!member || member.troopId !== args.troopId) {
      authError("NOT_FOUND", "Člen v tomto oddílu nebyl nalezen.");
    }

    const existing = await ctx.db
      .query("attendance")
      .withIndex("by_troop_date_member", (q) =>
        q
          .eq("troopId", args.troopId)
          .eq("meetingDate", args.meetingDate)
          .eq("memberId", args.memberId),
      )
      .unique();

    if (args.status === "unmarked") {
      if (existing) await ctx.db.delete(existing._id);
      return;
    }

    const update = {
      status: args.status,
      updatedBy: user._id,
      updatedAt: new Date().toISOString(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, update);
    } else {
      await ctx.db.insert("attendance", {
        troopId: args.troopId,
        memberId: args.memberId,
        meetingDate: args.meetingDate,
        ...update,
      });
    }
  },
});
