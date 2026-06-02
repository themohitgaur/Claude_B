import path from "node:path";
import {
  AGENTS_MD,
  CLAUDE_MD,
  SETTINGS_JSON,
  render,
} from "@claude-bootstrap/templates";
import { writeFileSafe, type WriteOptions } from "../util.js";
import type { ProjectMetadata } from "@claude-bootstrap/scanner";

export async function generateRootFiles(
  root: string,
  meta: ProjectMetadata,
  opts: WriteOptions = {},
): Promise<string[]> {
  const projectName = path.basename(meta.root);
  const frameworks = meta.frameworks.map((f) => f.id).join(", ") || "none detected";
  const ctx = {
    projectName,
    repoType: meta.repoType,
    frameworks,
    packageManager: meta.architecture.packageManager,
    architectureStyle: meta.architecture.style,
    testsPath: meta.architecture.hasTests ? "tests/ or __tests__/" : "(no tests yet)",
  };

  const written: string[] = [];
  written.push(
    await writeFileSafe(path.join(root, "CLAUDE.md"), render(CLAUDE_MD, ctx), opts).then(
      () => path.join(root, "CLAUDE.md"),
    ),
  );
  written.push(
    await writeFileSafe(path.join(root, "AGENTS.md"), render(AGENTS_MD, ctx), opts).then(
      () => path.join(root, "AGENTS.md"),
    ),
  );
  written.push(
    await writeFileSafe(path.join(root, ".claude", "settings.json"), SETTINGS_JSON, opts).then(
      () => path.join(root, ".claude", "settings.json"),
    ),
  );
  return written;
}
