# claude-bootstrap (CLI)

The user-facing CLI. Thin layer over `@claude-bootstrap/scanner` + `@claude-bootstrap/generators`.

```bash
npx claude-bootstrap init       # interactive wizard
npx claude-bootstrap init --yes # accept all recommended defaults
npx claude-bootstrap analyze    # report without writing
npx claude-bootstrap analyze --json
npx claude-bootstrap sync       # regenerate, preserving edits
npx claude-bootstrap sync --force
npx claude-bootstrap doctor     # validate the workspace
```

All commands accept `-C, --cwd <path>` to target a different directory.
