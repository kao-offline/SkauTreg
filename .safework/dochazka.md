# Safe-work record: Docházka

## Intent

- Goal: Add live, per-meeting troop attendance with a configurable regular meeting day.
- Scope: Convex schema/functions, troop settings, navigation, attendance UI, and focused tests.
- Owner: Codex `/root`.

## Git state

- Repository/worktree: `C:\Users\hrdyk\Documents\PROJEKTY-MOJE\SkautREG-project\SkauTreg`
- Base commit: `bf53f5706217484bbc169d0d5a244ec225bedb2d`
- Task branch: `feat/dochazka`
- Feature commit: See branch `HEAD`.
- Unrelated preserved file: untracked `icon.png` (not modified or staged).

## Environment

- Target: source implementation only; no deployment performed.
- Local configuration classification: development Convex deployment and test Clerk keys.
- Processes/ports: none started.

## Recovery

- Source recovery point: base commit `bf53f5706217484bbc169d0d5a244ec225bedb2d`.
- Rollback: revert the feature commit. The additive Convex fields/table can remain safely unused after an application rollback.
- External data/config changes: none.

## Verification

- `npm run typecheck`: passed.
- `npm run lint -- --quiet`: passed.
- `npm test`: 35 tests passed.
- `npm run build`: blocked by the repository's production environment validator because required live secrets, legal values, and feature stages are intentionally absent locally.

## Next action

- Review and deploy the additive Convex schema/functions to a non-production environment before opening the UI there.
