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

## Delivery result

- Source revision deployed: 573547afddf00cd50af6d58be866319bc3083dfd.
- Clean committed export: 42 tests passed. The working tree's 44 includes two pre-existing uncommitted backend tests.
- Vercel preview: https://skau-treg-f3uiqb0dy-kikoaidev-gmailcoms-projects.vercel.app
- Deployment ID: dpl_9JMeC3MTz3iiDb14gyfirJpmHa1d; Vercel status Ready.
- Verified via authenticated Vercel CLI: /api/health HTTP 200, release matches the source revision, app ok, Convex ok; /sign-in HTTP 200.
- PR: https://github.com/kao-offline/SkauTreg/pull/6, base feat/dochazka; CI was in progress at handoff. No merge or production promotion performed.
- Production rollback is unnecessary because production is unchanged. Preview can be superseded by a new deployment; source changes can be reverted through Git.
- Local logs and original tracked-work patch are in the repository's parent directory under SkauTreg-ui-* and SkauTreg-before-ui.patch. Ignored browser harness and clean deployment export are under tmp/.
