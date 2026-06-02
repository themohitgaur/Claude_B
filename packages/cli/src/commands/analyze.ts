import path from "node:path";
import ora from "ora";
import { scan } from "@claude-bootstrap/scanner";
import { recommendAgents, recommendSkills } from "@claude-bootstrap/generators";
import { ui } from "../ui.js";

export async function runAnalyze(opts: { cwd?: string; json?: boolean } = {}): Promise<void> {
  const root = path.resolve(opts.cwd ?? process.cwd());
  const spinner = ora("Analyzing repository…").start();
  const meta = await scan(root);
  spinner.succeed("Analysis complete");

  if (opts.json) {
    process.stdout.write(JSON.stringify(meta, null, 2) + "\n");
    return;
  }

  ui.title("Architecture report");
  ui.info(`Repo type: ${meta.repoType}`);
  ui.info(`Style: ${meta.architecture.style}`);
  ui.info(`Package manager: ${meta.architecture.packageManager}`);
  ui.info(`Docker: ${meta.architecture.hasDocker} · K8s: ${meta.architecture.hasKubernetes} · CI: ${meta.architecture.hasCi}`);

  ui.title("Frameworks");
  for (const f of meta.frameworks) {
    ui.step(`${f.id}${f.version ? ` @ ${f.version}` : ""} — confidence ${f.confidence.toFixed(2)}`);
  }

  ui.title("Services");
  for (const s of meta.services) ui.step(`${s.name} (${s.path}) — ${s.kind}`);

  ui.title("Recommended agents");
  for (const a of recommendAgents(meta)) ui.step(a);

  ui.title("Recommended skills");
  for (const s of recommendSkills(meta)) ui.step(s);

  ui.blank();
  ui.info("Run `npx claude-bootstrap init` to generate the workspace.");
}
