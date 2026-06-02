import path from "node:path";
import { HOOK_SH, render } from "@claude-bootstrap/templates";
import { writeFileSafe, type HookChoice, type WriteOptions } from "../util.js";
import type { ProjectMetadata } from "@claude-bootstrap/scanner";

interface HookDef {
  trigger: "PreToolUse" | "PostToolUse" | "TaskCompleted" | "SubagentStop";
  body: (meta: ProjectMetadata) => string;
}

const pm = (meta: ProjectMetadata) => {
  const v = meta.architecture.packageManager;
  return v === "unknown" ? "npm" : v;
};

const HOOKS: Record<HookChoice, HookDef> = {
  typecheck: {
    trigger: "PostToolUse",
    body: (m) => `${pm(m)} typecheck || ${pm(m)} -s tsc --noEmit`,
  },
  lint: { trigger: "PostToolUse", body: (m) => `${pm(m)} lint` },
  "unit-tests": { trigger: "TaskCompleted", body: (m) => `${pm(m)} test -- --run` },
  "security-scan": {
    trigger: "TaskCompleted",
    body: (m) => `${pm(m)} audit --audit-level=high || true`,
  },
  format: { trigger: "PostToolUse", body: (m) => `${pm(m)} -s prettier --write .` },
  build: { trigger: "TaskCompleted", body: (m) => `${pm(m)} build` },
  "pr-validation": {
    trigger: "SubagentStop",
    body: () => `git diff --check && git status --porcelain`,
  },
  "architecture-validation": {
    trigger: "SubagentStop",
    body: () => `echo "Architecture validation hook — wire your dependency-cruiser/eslint-rules here."`,
  },
};

export async function generateHooks(
  root: string,
  meta: ProjectMetadata,
  picks: HookChoice[],
  opts: WriteOptions = {},
): Promise<string[]> {
  const written: string[] = [];
  for (const id of picks) {
    const def = HOOKS[id];
    const sh = render(HOOK_SH, { name: id, trigger: def.trigger, body: def.body(meta) });
    const file = path.join(root, ".claude", "hooks", `${id}.sh`);
    await writeFileSafe(file, sh, { ...opts, executable: true });
    written.push(file);
  }
  return written;
}
