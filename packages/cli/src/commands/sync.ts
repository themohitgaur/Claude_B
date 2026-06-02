import path from "node:path";
import ora from "ora";
import { promises as fs } from "node:fs";
import { scan } from "@themohitgaur1/scanner";
import {
  generateKnowledge,
  generateProjectJson,
  generateRootFiles,
  type WriteOptions,
} from "@themohitgaur1/generators";
import { ui } from "../ui.js";

/**
 * Regenerates the non-user-customized assets from the latest scan.
 * Customized agents/commands/hooks/skills are preserved by default;
 * pass `--force` to overwrite everything.
 */
export async function runSync(opts: { cwd?: string; force?: boolean; preserve?: boolean } = {}) {
  const root = path.resolve(opts.cwd ?? process.cwd());
  const preserve = opts.preserve !== false && !opts.force;
  const writeOpts: WriteOptions = { preserve };

  const spinner = ora("Re-scanning repository…").start();
  const meta = await scan(root);
  spinner.succeed("Scan complete");

  ui.title("Syncing workspace");
  const gen = ora("Updating generated files…").start();
  try {
    await ensureClaudeDir(root);
    const rootFiles = await generateRootFiles(root, meta, writeOpts);
    const knowledge = await generateKnowledge(root, meta, writeOpts);
    await generateProjectJson(root, meta, { preserve: false }); // always refresh cache
    gen.succeed(`Synced ${rootFiles.length + knowledge.length + 1} files (preserve=${preserve})`);
  } catch (err) {
    gen.fail("Sync failed");
    throw err;
  }
}

async function ensureClaudeDir(root: string) {
  await fs.mkdir(path.join(root, ".claude"), { recursive: true });
  await fs.mkdir(path.join(root, ".ai"), { recursive: true });
}
