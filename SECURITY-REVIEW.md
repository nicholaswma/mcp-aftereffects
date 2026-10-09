# Creative Director fork security review

Reviewed 2026-10-09. Upstream: https://github.com/kumoproductions/mcp-aftereffects at d0b910c00656559583aeede310b7fb80c25d2cce (0.3.1). MIT license and attribution retained.

## Decision

Pass for a controlled, local inspection trial using `npm run start:inspect` after `npm ci --ignore-scripts` and `npm run build`. Not installed in Codex or connected to After Effects during this review. This is a scoped source/dependency review, not a security certification or sandbox guarantee.

## Changes

- Updated the lockfile's vulnerable dependencies. Initial npm audit: 15 affected packages (3 critical, 6 high, 6 moderate). Final npm audit: zero known vulnerabilities, including development dependencies.
- Updated oxfmt explicitly to 0.72.0 to remove its vulnerable tinypool dependency. One documentation code block was reformatted for the new formatter.
- Added an inspection launcher that forces read-only mode, disables arbitrary eval, and exposes only tools declared pure reads. No ae_do, rendering, saving, import, or export tool is registered in this profile. Project inspection can still reveal asset paths and content to the connected client.
- Marked this fork private in package.json to prevent accidental npm publication. This flag does not make the GitHub repository private.
- Gated the upstream release workflow to the upstream repository; our fork cannot enter its release job chain.
- CI installs with lifecycle scripts disabled and fails on any npm audit finding.

## Evidence

- npm run check: passed (source/test type checks, lint with existing warnings, formatting, JSX checks, server metadata, tool documentation, build).
- Offline suite excluding tests/e2e/** and tests/transport-offline.test.ts: 28 files passed; 376 tests passed, one skipped.
- Tests include policy enforcement, mailbox boundaries, JSON serialization, argument validation, batching, undo grouping, mocked pull transport, and real MCP stdio discovery. A new test verifies the six-tool inspection profile.
- npm audit: zero known findings after dependency updates.
- git diff --check: passed.
- Installation used --ignore-scripts; no resident agent/startup script installed, no application permissions changed, and no live AE call made.

## Source review and remaining boundaries

Reviewed MCP registration, capability policy, launch argument construction, file IPC, render/export writes, eval opt-in, instance/dialog control, package scripts, and CI/release workflows. The server uses local stdio/file IPC. No outbound telemetry or HTTP listener was found in the reviewed application source; dependencies are not exhaustively audited.

AE scripts execute with the user's permissions. The mailbox is a trust boundary: a same-user process able to write requests can bypass Node-side policy. Existing permissive mailbox directories are warned about, not rejected. Use a private per-user mailbox; do not share it or enable a resident agent as part of this inspection trial.

Upstream output-path checks are lexical and do not establish a filesystem sandbox, including against symlink aliases. The inspection profile therefore withholds filesystem output tools and the operation dispatcher entirely. Do not treat normal `npm start` or write mode as approved by this review. They retain upstream write capabilities, including menu commands; disabling eval alone does not make them safe.

Live native AE inspection, rendering, edits and undo remain unverified. The excluded transport-offline suite has platform launch behavior; live suites may contact or mutate AE. Neither was run on the user's desktop. Re-run dependency audit and checks whenever updating the fork; zero advisory findings only reflects the database at review time.
