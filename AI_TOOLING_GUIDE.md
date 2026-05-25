# AI Tooling Guide

This file explains how AI-support tools are used in this project.

## Principle

Spec Kit is the main method.
All other tools support Spec Kit; they do not replace it.

## Tools

### Spec Kit

Status: Mandatory.

Use for:
- constitution
- specify
- clarify
- plan
- tasks
- analyze
- checklist
- implement

### AGENTS.md

Status: Mandatory.

Purpose:
- persistent instructions for all agents
- prevents repeating the same instructions
- prevents restarting from zero

### Context7

Status: Use when needed.

Use when:
- an API may be outdated
- working with Expo, React Native, Supabase, Zustand, EAS/APK, or other libraries
- the model is unsure about current documentation

Do not use:
- for every simple task
- as a replacement for tests

### Repomix

Status: Optional later.

Use when:
- preparing AI handoff
- asking another AI to review the full project
- doing major architecture review
- debugging broad project context

Do not use:
- after every small change

### MCP Servers

Status: Planned, not activated by default.

Allowed candidates:
- filesystem
- git
- GitHub
- Context7
- Supabase later

Any MCP activation must be documented in MCP_SERVERS_PLAN.md and DECISIONS.md.

### Agent Skills

Status: Templates now, use later.

Use for repeated workflows:
- executing a Spec Kit node
- updating progress
- preparing handoff package
- updating asset manifest

### Custom Instructions

Status: File template only.

Use CUSTOM_INSTRUCTIONS.md as a source for ChatGPT Project or Custom Instructions.

### Cursor Rules

Status: File template only.

Use .cursor/rules/project-rules.mdc if the project is opened in Cursor later.

### Claude Project Instructions

Status: File template only.

Use CLAUDE_PROJECT_INSTRUCTIONS.md if using Claude Projects or Claude Code later.

### Task Master AI

Status: Deferred.

Use only after Spec Kit tasks exist and only if task tracking becomes too large.

### BMAD Method

Status: Deferred.

Use only as a critical review layer, not as a replacement for Spec Kit.

### Kiro

Status: Deferred.

Use only as an alternative/reference environment later, not as the main workflow.

## Stop Rule

If any tool causes confusion, duplicate work, or conflicts with Spec Kit, document the issue in DECISIONS.md and disable or defer the tool.
