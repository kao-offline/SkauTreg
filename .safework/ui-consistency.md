# UI consistency work record

- Task branch: fix/ui-consistency, based on feat/dochazka at 46589e943418ea9fb713035d85abca1138064c3d.
- Target: local validation and Vercel preview for linked project skau-treg. Production is unchanged.
- Preserve the green palette, dark sidebar, bold borders and existing feature set.
- Initial unrelated work: convex/lib/auth.ts, convex/troops.ts, convex/users.ts, icon.png, tests/convex/users.test.ts. These are excluded from the UI commit and preview artifact.
- Recovery: original tracked changes preserved in ../SkauTreg-before-ui.patch; unrelated untracked files remain in place. UI source can be rolled back by reverting its focused commit.
- Changes: shared layout dimensions and typography, troop selection across navigation, explicit dashboard scope/loading, immediate workspace navigation, native accessible dialogs, mobile sidebar focus handling and safe-area spacing.
- Tests added: dashboard context, sidebar selection/focus, dialog labels/dismissal/focus loop and prompt submission.
- Existing flaky OAuth tamper test uses the deterministic fix already present on origin/main; application security behavior is unchanged.
- Validation: typecheck passed; 44 Vitest tests passed; lint passed with 341 existing warnings; preview-mode build passed; six desktop/mobile Playwright tests passed. Actual prompt component also passed a Chromium check at 320px for autofocus, Tab containment, Escape and trigger focus restoration.
- Production-mode local build blocked by missing production credentials/settings. Preview mode is the configured alternative, not a production validation claim.
- npm audit:prod failed with 41 existing advisories (32 moderate, seven high, two critical). Dependencies and lockfile are unchanged.
- Authenticated service-backed workflows have not been exercised with a signed-in account. Convex tests use the repository test environment.
- Next: export committed files only and deploy to the verified Vercel preview project. Record deployment and PR results here after completion.
