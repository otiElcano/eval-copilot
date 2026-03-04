# eval-copilot

[Repository](https://github.com/otiElcano/eval-copilot)

A CLI tool that runs the same prompt N times through GitHub Copilot and generates a **side-by-side HTML report** to compare response variations across iterations.

![Node ≥ 20](https://img.shields.io/badge/node-%E2%89%A520.0.0-brightgreen) ![TypeScript](https://img.shields.io/badge/language-TypeScript-blue) ![SDK](https://img.shields.io/badge/%40github%2Fcopilot--sdk-0.1.26-purple)

---

## Why?

Language models are non-deterministic — the same prompt can produce meaningfully different outputs. `eval-copilot` lets you:

- **Evaluate consistency** — how similar are the responses across runs?
- **Compare models** — run the same prompt against `gpt-4o` and `claude-sonnet-4.5` and diff the reports.
- **Benchmark latency** — see per-iteration and average response times.
- **Audit tool usage** — which MCP tools did the model choose to invoke, and when?

---

## Requirements

- **Node.js ≥ 20**
- **GitHub Copilot** subscription (Individual, Business, or Enterprise)
- Authenticated via one of:
  - VS Code with the GitHub Copilot extension signed in, **or**
  - `gh auth login` (GitHub CLI)

---

## Installation

```bash
git clone https://github.com/otiElcano/eval-copilot.git
cd eval-copilot
npm install
npm run build
```

After building, you can run the tool directly:

```bash
node dist/index.js --help
```

Or install it globally so `eval-copilot` is available anywhere:

```bash
npm install -g .
eval-copilot --help
```

---

## Usage

```
eval-copilot [options]

Options:
  -p, --prompt <text>        Prompt text to evaluate (required)
  -x, --iterations <number>  Number of times to run the prompt (default: 3)
  -m, --model <name>         Model to use (default: "gpt-4o")
  --mcp <path>               Path to an MCP server config JSON file
  --disable-native-tools     Block built-in Copilot tools via hook
  -V, --version              Print version
  -h, --help                 Show help
```

---

## Examples

### Basic — 3 iterations with the default model

```bash
node dist/index.js -p "Explain recursion in one paragraph"
```

### More iterations, specific model

```bash
node dist/index.js \
  -p "Write a binary search function in Python" \
  -x 5 \
  -m claude-sonnet-4.5
```

### Disable native Copilot tools (e.g. workspace search)

Forces the model to answer from its own knowledge alone:

```bash
node dist/index.js \
  -p "What is the capital of France?" \
  -x 3 \
  --disable-native-tools
```

### With MCP servers

Connect external tools (filesystem, search, GitHub…) and let the model use them:

```bash
cp mcp-config.example.json mcp-config.json
# Edit mcp-config.json and fill in any required API tokens

node dist/index.js \
  -p "List all .ts files in /tmp and summarise their contents" \
  -x 2 \
  --mcp ./mcp-config.json
```

### MCP servers + native tools disabled (MCP-only mode)

The model can only use tools declared in your MCP config — all native Copilot tools are blocked:

```bash
node dist/index.js \
  -p "Search the web for the latest Node.js LTS version" \
  -x 3 \
  --mcp ./mcp-config.json \
  --disable-native-tools
```

---

## MCP Configuration

Pass a JSON file via `--mcp <path>`. The file must have a top-level `"servers"` object. Each entry is either a **local** (stdio) or **remote** (HTTP) server.

See [mcp-config.example.json](mcp-config.example.json) for a ready-to-use template.

### Local (stdio) server

```json
{
  "servers": {
    "filesystem": {
      "type": "local",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/tmp"],
      "tools": ["read_file", "list_directory"],
      "timeout": 30000
    }
  }
}
```

| Field | Required | Description |
|---|---|---|
| `type` | No | `"local"` or `"stdio"` (default: `"local"`) |
| `command` | Yes | Executable to launch |
| `args` | Yes | Arguments array |
| `env` | No | Extra environment variables |
| `tools` | No | Array of tool names to expose, or `"*"` for all |
| `timeout` | No | Timeout in ms |

### Remote (HTTP/SSE) server

```json
{
  "servers": {
    "my-api": {
      "type": "http",
      "url": "http://localhost:3100/mcp",
      "headers": { "Authorization": "Bearer <token>" },
      "tools": "*",
      "timeout": 15000
    }
  }
}
```

### `tools` field and `--disable-native-tools`

When `--disable-native-tools` is active, the tool intercepts every tool call via the SDK's `onPreToolUse` hook:

- Tools **listed by name** in any server's `tools` array → **allowed**
- Servers using `tools: "*"` → **all** tool calls are allowed (wildcard)
- Everything else (native Copilot tools) → **denied**

If you pass `--disable-native-tools` without `--mcp`, **all** tool calls are denied.

---

## Output

### Terminal summary

After all iterations complete, a summary is printed:

```
── Summary ─────────────────────────────────
   Total iterations : 3
   Successful       : 3
   Errors           : 0
   Avg latency      : 4321ms

📄  Report generated: eval_report_2026-02-24_15-30-00.html
```

### HTML report

An `eval_report_<timestamp>.html` file is written to the current working directory. Open it in any browser — no server needed.

The report includes:

- **Summary bar** — iterations, successes, errors, average latency
- **Prompt box** — the exact prompt that was evaluated
- **Side-by-side columns** — one card per iteration, showing:
  - Status badge (✓ / ✗) and latency
  - Full response with code blocks syntax-highlighted in `<pre><code>`
  - Token usage (input / output) when available
  - List of MCP tools invoked with per-tool duration

---

## Development

```bash
# Type-check without compiling
npm run build -- --noEmit

# Compile to dist/
npm run build

# Run directly from source with tsx (no compile step)
npm run dev -- -p "Hello world" -x 2
```

### Project structure

```
src/
├── index.ts    — CLI entry point (commander)
├── runner.ts   — Core eval loop (auth, model validation, iterations)
├── mcp.ts      — MCP config file parser and validator
├── report.ts   — HTML report generator
└── types.ts    — Shared TypeScript types
```

---

## Troubleshooting

**`Not authenticated with GitHub Copilot`**
Run `gh auth login` or open VS Code and sign in to the GitHub Copilot extension, then retry.

**`Model "xyz" is not available`**
The tool will print the full list of models available on your account. Use one of those IDs with `-m`.

**`Cannot read MCP config file`**
Check that the path passed to `--mcp` exists and is readable. The file must be valid JSON with a `"servers"` top-level key.

**One iteration fails but others succeed**
This is expected behaviour — the tool catches per-iteration errors, records them in the report, and continues. Check the error card in the HTML report for the full error message.

---

## License

MIT
