# Copilot Instructions — eval-copilot

## Project overview

`eval-copilot` is a TypeScript CLI tool that runs a prompt N times through the GitHub Copilot API via `@github/copilot-sdk` and generates a self-contained HTML report for side-by-side comparison of responses.

The codebase follows **SOLID principles** throughout: each class/module has a single responsibility, behaviour is extended via interfaces rather than editing existing code, interfaces are minimal and role-specific, and all external dependencies (SDK client, spinner, file system) are injected through abstractions rather than constructed inline.

## Tech stack

- **Runtime**: Node.js ≥ 20, ESM-only (`"type": "module"` in package.json)
- **Language**: TypeScript 5, compiled with `tsc` to `dist/`, targeting `NodeNext` / `ESNext`
- **SDK**: `@github/copilot-sdk@^0.1.26` — JSON-RPC bridge to the `@github/copilot` CLI binary
- **CLI parsing**: `commander`
- **Terminal feedback**: `ora` spinners
- **Output**: native `node:fs/promises` — no runtime dependencies for the HTML report

## Module structure

### Entry point & composition root

| File | Responsibility |
|---|---|
| `src/index.ts` | CLI entry point — parses args with `commander`, instantiates concrete adapters, calls `runEval` and `generateReport`, prints summary |

### Core business logic

| File | Responsibility |
|---|---|
| `src/runner.ts` | Eval loop — auth validation, model resolution, MCP config loading, iteration sequencing. Receives all deps via injection. |
| `src/report.ts` | HTML report builder — `escapeHtml`, `formatResponseToHtml`, `buildCSS`, `buildHTML`. Accepts optional `IReportWriter`. |
| `src/mcp.ts` | MCP config file parser — reads JSON, validates fields, returns `mcpServers` map and tool name set |
| `src/SessionEventCollector.ts` | Attaches / detaches the 5 SDK session event listeners; accumulates tool, reasoning and usage data |

### Types

| File | Responsibility |
|---|---|
| `src/types.ts` | `BaseIterationResult` (generic), `AuditIterationResult` (security fields), `IterationResult` alias, `EvalOptions`, `ToolInvocationRecord`, `UsageInfo` |

### Interfaces (`src/interfaces/`)

| File | Contract |
|---|---|
| `ICopilotClientAdapter.ts` | `start/stop/getAuthStatus/listModels/createSession` + `ISession`, `CreateSessionOptions` |
| `IProgressReporter.ts` | `start(label) / succeed(label) / fail(label)` |
| `IPromptTransformer.ts` | `transform(userPrompt): string` |
| `IReportWriter.ts` | `write(html, timestamp): Promise<string>` |

### Adapters (`src/adapters/`)

| File | Wraps |
|---|---|
| `SdkCopilotClientAdapter.ts` | `CopilotClient` — all SDK casts (`LooseSession`, `approveAll`) confined here |
| `OraProgressReporter.ts` | `ora` — all spinner state confined here |
| `FileSystemReportWriter.ts` | `node:fs/promises` + `node:path` — disk writes confined here |

### Prompt strategies (`src/prompts/`)

| File | Behaviour |
|---|---|
| `AuditPromptTransformer.ts` | Wraps prompt in Spanish-language security-audit template + VULN markers |
| `IdentityPromptTransformer.ts` | No-op passthrough — for plain (non-audit) eval mode |

### Utilities (`src/utils/`)

| File | Exports |
|---|---|
| `stats.ts` | `computeEvalStats(results)` — shared by `index.ts` and `report.ts` |

## SOLID principles

### S — Single Responsibility
- `SessionEventCollector` owns only the lifecycle of SDK event listeners.
- `buildHTML` renders HTML; stats are computed by `computeEvalStats` in `utils/stats.ts`.
- Each adapter class owns exactly one external concern (SDK, spinner, or file system).

### O — Open / Closed
- New prompt strategies are added by implementing `IPromptTransformer` — `runner.ts` never changes.
- New report output targets (S3, in-memory, etc.) implement `IReportWriter` — `report.ts` never changes.

### L — Liskov Substitution
- Any `IPromptTransformer` can replace another without affecting the runner.
- Any `IReportWriter` can replace another without affecting `generateReport`.

### I — Interface Segregation
- `BaseIterationResult` — generic eval fields only. Callers that don't care about security markers use this.
- `AuditIterationResult extends BaseIterationResult` — adds the four security-domain fields.
- Each interface (`IProgressReporter`, `IPromptTransformer`, `IReportWriter`) exposes only the methods its consumer needs.

### D — Dependency Inversion
- `runEval` depends on `ICopilotClientAdapter`, `IProgressReporter`, `IPromptTransformer` — never on concrete classes.
- `generateReport` depends on `IReportWriter` — defaults to `new FileSystemReportWriter()` for backward compat.
- `src/index.ts` is the **composition root**: the only place concrete classes are instantiated.

## Key conventions

### TypeScript
- Strict mode is on — no `any`, no implicit `any`; use `unknown` + type guards instead
- All imports must include `.js` extensions (required for NodeNext ESM resolution)
- Prefer `type` imports for interfaces that are only used at compile time
- Use `node:` prefix for all Node.js built-ins (e.g. `node:fs/promises`, `node:path`)

### SDK usage patterns
- Always call `clientAdapter.start()` before any other method and `clientAdapter.stop()` when done
- **Cycle `stop()` → `start()` between iterations** — `CopilotClient`'s auth token is invalidated after the first session is destroyed; cycling resets it cleanly
- Create a **new session per iteration** via `clientAdapter.createSession()` — never reuse sessions
- Use `session.sendAndWait()` for response capture
- `LooseSession` cast and `approveAll` are confined to `SdkCopilotClientAdapter` — do not replicate them elsewhere
- Always call `session.destroy()` in a `finally` block after each iteration

### Error handling
- Per-iteration errors must be caught and stored in `AuditIterationResult.error` — the loop must continue
- Fatal errors (auth failure, invalid model) must throw so `index.ts` can exit with code 1
- Never swallow errors silently; always surface them either in the result array or by rethrowing

### HTML report
- All user-supplied strings written to HTML must go through `escapeHtml()` — no exceptions
- Fenced code blocks (` ```lang `) are converted to `<pre><code class="language-lang">` before paragraph wrapping
- All CSS is inlined in `<style>` — the output file must work offline with no external resources
- Dark theme palette: background `#0d1117`, surface `#161b22`, border `#30363d` (GitHub dark)

### CLI options
The accepted options — do not add new ones without updating `EvalOptions` in `src/types.ts` and the README:
- `-p / --prompt` (required)
- `-x / --iterations` (default: 3)
- `-m / --model` (default: `gpt-4.1`)
- `--mcp <path>`
- `--token <tok>`
- `--iteration-timeout <seconds>` (default: 1200) — hard ceiling for the entire iteration
- `--inactivity-timeout <seconds>` (default: 120, set 0 to disable) — resets on every session event; fires only when the session is genuinely stuck

## Build & run

```bash
npm run build          # tsc → dist/
npm run dev -- [args]  # tsx src/index.ts (no compile step)
node dist/index.js -p "your prompt" -x 3
```

## What to avoid

- Do not use `require()` or CommonJS patterns — this is a pure ESM project
- Do not add `express`, `axios`, or any HTTP server/client libraries — the tool is purely local
- Do not store API keys or tokens in source files — auth relies on the stored `gh` CLI credentials
- Do not make iteration loop iterations concurrent — sequential execution is intentional to respect rate limits
- Do not modify `dist/` directly — it is generated by `tsc` and git-ignored
- Do not instantiate concrete adapters outside `src/index.ts` — keep it the sole composition root
- Do not add `ora`, `CopilotClient`, or `fs/promises` imports in `runner.ts` or `report.ts` — use the injected interfaces
