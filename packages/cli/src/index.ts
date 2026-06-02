import { Command } from "commander";
import { banner, ui } from "./ui.js";
import { runInit } from "./commands/init.js";
import { runAnalyze } from "./commands/analyze.js";
import { runSync } from "./commands/sync.js";
import { runDoctor } from "./commands/doctor.js";

const program = new Command();

program
  .name("claude-bootstrap")
  .description("AI Workspace Generator for Claude Code")
  .version("1.0.0")
  .hook("preAction", () => banner());

program
  .command("init")
  .description("Scan the repo and generate a complete Claude Code workspace")
  .option("-C, --cwd <path>", "Run against a different directory")
  .option("-y, --yes", "Accept all recommended defaults — no prompts")
  .action(async (opts) => {
    try {
      await runInit(opts);
    } catch (e) {
      ui.err((e as Error).message);
      process.exit(1);
    }
  });

program
  .command("analyze")
  .description("Analyze the repository and print an architecture report")
  .option("-C, --cwd <path>", "Run against a different directory")
  .option("--json", "Emit raw ProjectMetadata as JSON")
  .action(async (opts) => {
    try {
      await runAnalyze(opts);
    } catch (e) {
      ui.err((e as Error).message);
      process.exit(1);
    }
  });

program
  .command("sync")
  .description("Regenerate Claude assets from the latest scan (preserves edits by default)")
  .option("-C, --cwd <path>", "Run against a different directory")
  .option("--force", "Overwrite all generated files, including human edits")
  .action(async (opts) => {
    try {
      await runSync(opts);
    } catch (e) {
      ui.err((e as Error).message);
      process.exit(1);
    }
  });

program
  .command("doctor")
  .description("Validate the workspace — missing files, broken configs, invalid agents")
  .option("-C, --cwd <path>", "Run against a different directory")
  .action(async (opts) => {
    try {
      await runDoctor(opts);
    } catch (e) {
      ui.err((e as Error).message);
      process.exit(1);
    }
  });

program
  .command("add-agent")
  .description("(stub) Add a new subagent after install")
  .action(() => {
    ui.warn("add-agent is a v1.1 surface — wire to generateAgents() in your fork.");
  });

program
  .command("add-mcp")
  .description("(stub) Add a new MCP server config")
  .action(() => {
    ui.warn("add-mcp is a v1.1 surface — wire to generateMcp() in your fork.");
  });

program.parseAsync(process.argv).catch((e) => {
  ui.err((e as Error).message);
  process.exit(1);
});
