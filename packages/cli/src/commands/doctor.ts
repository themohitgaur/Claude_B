import path from "node:path";
import { promises as fs } from "node:fs";
import { ui } from "../ui.js";

interface Check {
  name: string;
  run: (root: string) => Promise<{ ok: boolean; detail?: string }>;
}

const CHECKS: Check[] = [
  {
    name: "CLAUDE.md present",
    run: async (root) => exists(path.join(root, "CLAUDE.md")),
  },
  {
    name: "AGENTS.md present",
    run: async (root) => exists(path.join(root, "AGENTS.md")),
  },
  {
    name: ".claude/settings.json valid JSON",
    run: async (root) => {
      const p = path.join(root, ".claude", "settings.json");
      try {
        JSON.parse(await fs.readFile(p, "utf8"));
        return { ok: true };
      } catch (e) {
        return { ok: false, detail: (e as Error).message };
      }
    },
  },
  {
    name: ".claude/mcp/config.json valid JSON (if present)",
    run: async (root) => {
      const p = path.join(root, ".claude", "mcp", "config.json");
      try {
        const raw = await fs.readFile(p, "utf8");
        JSON.parse(raw);
        return { ok: true };
      } catch (e) {
        if ((e as NodeJS.ErrnoException).code === "ENOENT") return { ok: true, detail: "skipped (not configured)" };
        return { ok: false, detail: (e as Error).message };
      }
    },
  },
  {
    name: "Hook scripts executable",
    run: async (root) => {
      if (process.platform === "win32") return { ok: true, detail: "skipped on Windows" };
      const dir = path.join(root, ".claude", "hooks");
      try {
        const entries = await fs.readdir(dir);
        for (const e of entries) {
          if (!e.endsWith(".sh")) continue;
          const st = await fs.stat(path.join(dir, e));
          if (!(st.mode & 0o111)) return { ok: false, detail: `${e} not executable` };
        }
        return { ok: true };
      } catch {
        return { ok: true, detail: "skipped (no hooks)" };
      }
    },
  },
  {
    name: ".ai/project.json present (run `sync` to refresh)",
    run: async (root) => exists(path.join(root, ".ai", "project.json")),
  },
];

async function exists(p: string) {
  try {
    await fs.access(p);
    return { ok: true };
  } catch {
    return { ok: false, detail: `missing: ${p}` };
  }
}

export async function runDoctor(opts: { cwd?: string } = {}): Promise<void> {
  const root = path.resolve(opts.cwd ?? process.cwd());
  ui.title("Workspace doctor");

  let failures = 0;
  for (const c of CHECKS) {
    const res = await c.run(root);
    if (res.ok) ui.ok(c.name + (res.detail ? `  E${res.detail}` : ""));
    else {
      ui.err(`${c.name}  E${res.detail ?? "failed"}`);
      failures++;
    }
  }

  ui.blank();
  if (failures === 0) ui.ok("All checks passed.");
  else {
    ui.warn(`${failures} check(s) failed. Run \`npx @themohitgaur1/claude-bootstrap sync\` to repair generated files.`);
    process.exitCode = 1;
  }
}
