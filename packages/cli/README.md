# claude-bootstrap (CLI)

The user-facing CLI. Thin layer over `@themohitgaur1/scanner` + `@themohitgaur1/generators`.

```bash
npx @themohitgaur1/claude-bootstrap init       # interactive wizard
npx @themohitgaur1/claude-bootstrap init --yes # accept all recommended defaults
npx @themohitgaur1/claude-bootstrap analyze    # report without writing
npx @themohitgaur1/claude-bootstrap analyze --json
npx @themohitgaur1/claude-bootstrap sync       # regenerate, preserving edits
npx @themohitgaur1/claude-bootstrap sync --force
npx @themohitgaur1/claude-bootstrap doctor     # validate the workspace
```

All commands accept `-C, --cwd <path>` to target a different directory.
