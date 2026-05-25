# MCP Servers Plan

MCP servers are optional and must not be activated without a clear reason.

## Planned Candidates

| MCP | Status | Purpose |
|---|---|---|
| filesystem | Deferred | Structured file access if needed |
| git | Deferred | Git inspection and automation if useful |
| GitHub | Deferred | Issues, PRs, and repository operations |
| Context7 | Use when needed | Current documentation for libraries |
| Supabase | Later | Multiplayer backend work |

## Activation Rule

Before activating any MCP server, document in DECISIONS.md:

1. Why it is needed.
2. Expected benefit.
3. Possible risk or complexity.
4. How it will be disabled if it causes confusion.

## Current Decision

No MCP server is required during bootstrap.
