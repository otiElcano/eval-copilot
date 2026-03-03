Release notes — feature: disable-builtins / allow-tool

Summary
- Added `--disable-builtin-mcps` flag to mirror `copilot --disable-builtin-mcps`.
- Added `--allow-tool <name>` option (repeatable) to explicitly whitelist tools even when disable flags are active.
- Updated `onPreToolUse` hook in `src/runner.ts` so `--allow-tool` has highest priority, followed by `--disable-tool` and the global disable flags.

Usage
- Example: `node dist/index.js -p "your prompt" --disable-builtin-mcps --allow-tool write`

Notes
- Both flags are exposed in the CLI (`src/index.ts`) and `EvalOptions` in `src/types.ts`.
- Behavior tested locally; TypeScript build completes (`npm run build`).
