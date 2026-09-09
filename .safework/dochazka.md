# Safe-work record: Docházka

## Intent

- Goal: Add live, per-meeting troop attendance with a configurable regular meeting day.
- Scope: Convex schema/functions, troop settings, navigation, attendance UI, and focused tests.
- Owner: Codex `/root`.

## Git state

- Repository/worktree: `C:\Users\hrdyk\Documents\PROJEKTY-MOJE\SkautREG-project\SkauTreg`
- Base commit: `bf53f5706217484bbc169d0d5a244ec225bedb2d`
- Task branch: `feat/dochazka`
- Feature commit: `e5a95f4bea5f23165826bc91238fd774d06d6195`.
- Unrelated preserved file: untracked `icon.png` (not modified or staged).

## Environment

- Target: local Next.js server plus the configured development Convex deployment; production was not touched.
- Local configuration classification: development Convex deployment and test Clerk keys.
- Processes/ports: one verified SkauTreg Next.js development server on port 3000.

## Recovery

- Source recovery point: base commit `bf53f5706217484bbc169d0d5a244ec225bedb2d`.
- Rollback: revert the feature commit. The additive Convex fields/table can remain safely unused after an application rollback.
- Generated route-cache backup: `C:\Users\hrdyk\Documents\PROJEKTY-MOJE\SkautREG-project\SkauTreg-next-route-cache-backup-20260909-101027`.
- Development Convex rollback: deploy the Convex functions from the preceding commit; the additive attendance table and indexes can remain unused.

## Verification

- `npm run typecheck`: passed.
- `npm run lint -- --quiet`: passed.
- `npm test`: 35 tests passed.
- `VERCEL_ENV=preview npm run build`: passed and listed `/home`, `/troop`, `/troop/[troopId]/leaders`, and `/troop/[troopId]/attendance`.
- `npx convex dev --once`: passed against the verified development deployment; added the three attendance indexes and published functions.
- Runtime route check after preserving the corrupt cache and restarting one server: `/sign-in` returns 200, authenticated `/troop` returns 200, and protected unauthenticated routes redirect to sign-in instead of returning 404.

## Next action

- Reload the existing preview tab and verify the authenticated leader and attendance pages interactively.
