import path from "node:path";
import { COMMAND_MD, render } from "@themohitgaur1/templates";
import { writeFileSafe, type CommandPack, type WriteOptions } from "../util.js";

const COMMANDS: Record<CommandPack, { description: string; body: string }> = {
  feature: {
    description: "Plan and implement a new feature end-to-end.",
    body: `Read AGENTS.md and .ai/knowledge/ARCHITECTURE.md first.

1. Restate the feature in your own words.
2. Identify affected layers (UI, API, DB) and existing patterns to follow.
3. Produce a short plan (files to create/change, tests).
4. Implement, then run lint + tests.
5. Summarize the diff and any follow-ups.`,
  },
  bugfix: {
    description: "Diagnose and fix a bug with a regression test.",
    body: `1. Reproduce the bug with a failing test before changing source.
2. Identify the smallest possible fix.
3. Apply it and re-run the test suite.
4. Note the root cause in the PR description.`,
  },
  refactor: {
    description: "Refactor without changing behavior.",
    body: `1. Confirm tests exist for the touched code. If not, write them first.
2. Make the refactor in small commits.
3. Re-run tests after each step.`,
  },
  review: {
    description: "Review a diff for quality, standards, and architecture compliance.",
    body: `Check: naming, dead code, security, error handling, test coverage, doc updates, performance hotspots.`,
  },
  api: {
    description: "Add or modify an API endpoint.",
    body: `1. Define request/response schema first.
2. Add validation.
3. Implement handler + tests.
4. Update API docs / OpenAPI if present.`,
  },
  database: {
    description: "Schema change or migration.",
    body: `1. Write the migration.
2. Update ORM models/queries.
3. Add seed data if relevant.
4. Verify rollback works.`,
  },
  ui: {
    description: "Add or modify a UI component or screen.",
    body: `1. Reuse existing components and tokens.
2. Match accessibility patterns.
3. Add stories/tests where applicable.`,
  },
  testing: {
    description: "Add or improve tests.",
    body: `Pick the smallest unit that proves the behavior. Prefer unit over integration over e2e.`,
  },
  documentation: {
    description: "Write or update docs.",
    body: `Update README, API docs, and .ai/knowledge/* as needed.`,
  },
};

export async function generateCommands(
  root: string,
  picks: CommandPack[],
  opts: WriteOptions = {},
): Promise<string[]> {
  const written: string[] = [];
  for (const id of picks) {
    const def = COMMANDS[id];
    const md = render(COMMAND_MD, { name: id, description: def.description, body: def.body });
    const file = path.join(root, ".claude", "commands", `${id}.md`);
    await writeFileSafe(file, md, opts);
    written.push(file);
  }
  return written;
}
