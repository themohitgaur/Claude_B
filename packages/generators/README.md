# @claude-bootstrap/generators

Pure functions that turn `ProjectMetadata` (from `@claude-bootstrap/scanner`) into files on disk:

| Generator | Output |
|---|---|
| `generateRootFiles` | `CLAUDE.md`, `AGENTS.md`, `.claude/settings.json` |
| `generateAgents` | `.claude/agents/*.md` |
| `generateCommands` | `.claude/commands/*.md` |
| `generateHooks` | `.claude/hooks/*.sh` (chmod +x) |
| `generateSkills` | `.claude/skills/<id>/SKILL.md` |
| `generateMcp` | `.claude/mcp/config.json` |
| `generateKnowledge` | `.ai/knowledge/*.md` |
| `generateProjectJson` | `.ai/project.json` (cached scanner output) |

All generators accept `{ preserve?: boolean }` so `sync --preserve` won't clobber human-edited files.

`recommendAgents(meta)` and `recommendSkills(meta)` produce sensible defaults from detected stack — the wizard pre-checks those in Inquirer.
