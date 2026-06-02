# Architecture

```
                ┌──────────────────────────┐
                │  CLI (commander+inquirer)│
                │  init/analyze/sync/doctor│
                └────────────┬─────────────┘
                             │
                ┌────────────▼─────────────┐
                │       Scanner            │  ← CORE
                │  detects: frameworks,    │
                │  arch, services, langs   │
                └────────────┬─────────────┘
                             │ ProjectMetadata
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
        Generators      Recommenders    .ai/project.json
        (pure fns)      (agents,         (cache)
              │          skills)
              ▼
        Templates (inline strings)
              │
              ▼
   .claude/{agents,commands,hooks,skills,mcp,settings.json}
   .ai/knowledge/{ARCHITECTURE,AUTH,DB,API,WORKFLOWS,BUSINESS_RULES}.md
   CLAUDE.md  +  AGENTS.md
```

The **Scanner is the single source of truth**. Everything downstream is a pure transform
of `ProjectMetadata`. That means `sync` is a no-op when nothing changed, `doctor` can
compare disk against the cached metadata, and adding a new generator never requires
re-architecting the wizard.

## Why AGENTS.md *and* CLAUDE.md
`AGENTS.md` is becoming the cross-tool standard (Claude, Cursor, Gemini CLI, Copilot, Aider).
`CLAUDE.md` extends it with Claude-specific affordances. Tool-specific files MUST NOT contradict `AGENTS.md`.
