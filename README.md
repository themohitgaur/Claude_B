# Claude Bootstrap

> AI Workspace Generator for Claude Code  Eturn any repository into a fully configured Claude Code workspace in under a minute.

[![npm version](https://img.shields.io/npm/v/@themohitgaur1/claude-bootstrap.svg)](https://www.npmjs.com/package/@themohitgaur1/claude-bootstrap)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## What it does

`claude-bootstrap` scans your repository, detects your stack (frameworks, architecture, patterns, services), and generates a complete AI development environment:

- `CLAUDE.md` + `AGENTS.md` (cross-tool AGENTS.md standard for Claude/Cursor/Gemini/Copilot)
- `.claude/agents/*`  ESubagents generated from detected architecture
- `.claude/commands/*`  ESlash commands (feature, bugfix, review, refactor…)
- `.claude/hooks/*`  EPreToolUse, PostToolUse, TaskCompleted, SubagentStop
- `.claude/skills/*`  EReact, Node, NestJS, DB, Testing, DevOps…
- `.claude/mcp/*`  EFilesystem, GitHub, Postgres, Playwright, Slack, Jira, Redis, Kafka
- `.ai/knowledge/*`  EARCHITECTURE, AUTH, DATABASE, API_GUIDELINES, WORKFLOWS, BUSINESS_RULES

The **Scanner + Context Engine** is the core. Everything else (agents, hooks, MCP configs, skills, subagents) is generated *from* the metadata it produces.

## Install / Run

```bash
npx @themohitgaur1/claude-bootstrap init
```

No global install required.

## Commands

| Command | Purpose |
|---|---|
| `init` | Interactive wizard  Escan repo, pick agents/hooks/MCP/skills, generate workspace |
| `analyze` | Scan repo and emit architecture report + recommendations (no writes) |
| `sync` | Regenerate Claude assets from latest metadata |
| `doctor` | Validate workspace  Emissing files, broken MCP configs, invalid agents |
| `add-agent` | Add a new subagent after install |
| `add-mcp` | Add a new MCP server config |

## Monorepo layout

```
packages/
├── cli          # Commander-based CLI entry  Einit/analyze/sync/doctor
├── scanner      # Framework, architecture, pattern, library detection (core engine)
├── generators   # Agent / command / hook / skill / MCP / knowledge generators
└── templates    # Markdown + JSON templates rendered by generators
```

## Tech

TypeScript · pnpm workspaces · Commander · Inquirer · Chalk · Ora · ts-morph · fast-glob · Vitest

## Repository types supported

Frontend (React/Next/Vite) · Backend (Node/NestJS/Express) · Full-stack · Microservices · Monorepo

## Develop

```bash
pnpm install
pnpm build
pnpm cli -- init
```

## License

MIT
