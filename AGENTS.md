# AGENTS.md

## Memory Bootstrap (Required)
At the start of each session in this repo, read:
1. `C:\Users\micha\.codex\memory\MASTER_CONTEXT.md`
2. `C:\Users\micha\.codex\memory\MEMORY_PROTOCOL.md`
3. `D:\Coding\Terminal 3d web version 2\context.md` (if it exists)

Then provide a 2-5 line recap of known project state before new work.

## Memory Persistence (Required)
After every user input/turn:
1. Append an atomic progress entry to `D:\Coding\Terminal 3d web version 2\context.md`.
2. If milestone-level, append one concise note to `C:\Users\micha\.codex\memory\MASTER_CONTEXT.md`.

## Atomic Entry Requirements
- Document: task handled, files changed, commands/tests run + results, bugs investigated/fixed, feature changes, next step.
- Every entry must include:
  - `Timestamp: YYYY-MM-DD HH:mm:ss (local time)`
  - `Signed: <AgentName>`

## Continuous Context Extraction
- Keep `AGENTS.md`, `CLAUDE.md`, and `GEMINI.md` current with relevant, up-to-date constraints and next-step focus.
- Agents do not need to re-read full context every turn after bootstrap; keep recent/relevant state active.
