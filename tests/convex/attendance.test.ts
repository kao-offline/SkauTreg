import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import schema from "../../convex/schema";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

const modules = import.meta.glob("../../convex/**/*.ts");

async function seedAttendance() {
  const t = convexTest(schema, modules);
  const fixture = await t.run(async (ctx) => {
    const ownerId = await ctx.db.insert("users", { name: "Owner", tokenIdentifier: "test|owner" });
    const leaderId = await ctx.db.insert("users", { name: "Leader", tokenIdentifier: "test|leader" });
    const roverId = await ctx.db.insert("users", { name: "Rover", tokenIdentifier: "test|rover" });
    const outsiderId = await ctx.db.insert("users", { name: "Outsider", tokenIdentifier: "test|outsider" });
    const troopId = await ctx.db.insert("troops", { name: "A", ownerId, meetingDay: 4 });
    const otherTroopId = await ctx.db.insert("troops", { name: "B", ownerId: outsiderId });
    await ctx.db.insert("troop_leaders", { troopId, userId: leaderId, role: "leader" });
    await ctx.db.insert("troop_leaders", { troopId, userId: roverId, role: "rover" });
    const memberId = await ctx.db.insert("members", { troopId, name: "Adam" });
    const secondMemberId = await ctx.db.insert("members", { troopId, name: "Bára", nickname: "Bee" });
    const foreignMemberId = await ctx.db.insert("members", { troopId: otherTroopId, name: "Foreign" });
    return { troopId, memberId, secondMemberId, foreignMemberId };
  });

  return {
    t,
    fixture: fixture as {
      troopId: Id<"troops">;
      memberId: Id<"members">;
      secondMemberId: Id<"members">;
      foreignMemberId: Id<"members">;
    },
  };
}

describe("attendance", () => {
  it("lets multiple leaders update one shared meeting roster", async () => {
    const { t, fixture } = await seedAttendance();
    const owner = t.withIdentity({ tokenIdentifier: "test|owner" });
    const leader = t.withIdentity({ tokenIdentifier: "test|leader" });

    await owner.mutation(api.attendance.setStatus, {
      troopId: fixture.troopId,
      memberId: fixture.memberId,
      meetingDate: "2026-09-10",
      status: "present",
    });
    await leader.mutation(api.attendance.setStatus, {
      troopId: fixture.troopId,
      memberId: fixture.secondMemberId,
      meetingDate: "2026-09-10",
      status: "excused",
    });

    const roster = await owner.query(api.attendance.getForDate, {
      troopId: fixture.troopId,
      meetingDate: "2026-09-10",
    });
    expect(roster.map((row) => [row.name, row.status])).toEqual([
      ["Adam", "present"],
      ["Bára", "excused"],
    ]);
  });

  it("updates one member/date record and removes it when reset", async () => {
    const { t, fixture } = await seedAttendance();
    const owner = t.withIdentity({ tokenIdentifier: "test|owner" });
    const args = {
      troopId: fixture.troopId,
      memberId: fixture.memberId,
      meetingDate: "2026-09-10",
    };

    await owner.mutation(api.attendance.setStatus, { ...args, status: "present" });
    await owner.mutation(api.attendance.setStatus, { ...args, status: "absent" });
    expect(await t.run((ctx) => ctx.db.query("attendance").collect())).toHaveLength(1);

    await owner.mutation(api.attendance.setStatus, { ...args, status: "unmarked" });
    expect(await t.run((ctx) => ctx.db.query("attendance").collect())).toHaveLength(0);

    await owner.mutation(api.attendance.setStatus, { ...args, status: "present" });
    await owner.mutation(api.members.remove, { id: fixture.memberId });
    expect(await t.run((ctx) => ctx.db.query("attendance").collect())).toHaveLength(0);
  });

  it("rejects signed-out, rover, cross-troop, and invalid-date writes", async () => {
    const { t, fixture } = await seedAttendance();
    const args = {
      troopId: fixture.troopId,
      memberId: fixture.memberId,
      meetingDate: "2026-09-10",
      status: "present" as const,
    };

    await expect(t.query(api.attendance.getForDate, {
      troopId: fixture.troopId,
      meetingDate: args.meetingDate,
    })).rejects.toThrow();
    await expect(t.withIdentity({ tokenIdentifier: "test|rover" }).mutation(api.attendance.setStatus, args)).rejects.toThrow();
    await expect(t.withIdentity({ tokenIdentifier: "test|owner" }).mutation(api.attendance.setStatus, {
      ...args,
      memberId: fixture.foreignMemberId,
    })).rejects.toThrow();
    await expect(t.withIdentity({ tokenIdentifier: "test|owner" }).mutation(api.attendance.setStatus, {
      ...args,
      meetingDate: "2026-02-31",
    })).rejects.toThrow();
  });
});
