import inquirer from "inquirer";
import ora from "ora";
import path from "node:path";
import { scan, type ProjectMetadata, type RepoType } from "@claude-bootstrap/scanner";
import {
  generateAgents,
  generateCommands,
  generateHooks,
  generateKnowledge,
  generateMcp,
  generateProjectJson,
  generateRootFiles,
  generateSkills,
  recommendAgents,
  recommendSkills,
  type AgentChoice,
  type CommandPack,
  type HookChoice,
  type McpChoice,
  type SkillPack,
} from "@claude-bootstrap/generators";
import { ui } from "../ui.js";

interface InitOptions {
  cwd?: string;
  yes?: boolean;
}

const REPO_TYPES: RepoType[] = ["frontend", "backend", "fullstack", "microservices", "monorepo"];

export async function runInit(opts: InitOptions = {}): Promise<void> {
  const root = path.resolve(opts.cwd ?? process.cwd());

  ui.title("Scanning repository");
  const spinner = ora("Detecting frameworks, services, and architecture…").start();
  let meta: ProjectMetadata;
  try {
    meta = await scan(root);
    spinner.succeed(`Scanned ${path.basename(root)}`);
  } catch (err) {
    spinner.fail("Scan failed");
    throw err;
  }

  printDetection(meta);

  // ---- Wizard ------------------------------------------------------------
  const answers = opts.yes
    ? defaultAnswers(meta)
    : await inquirer.prompt<{
        repoType: RepoType;
        confirmStack: boolean;
        agents: AgentChoice[];
        mcp: McpChoice[];
        hooks: HookChoice[];
        commands: CommandPack[];
        skills: SkillPack[];
      }>([
        {
          type: "list",
          name: "repoType",
          message: "What type of repository is this?",
          choices: REPO_TYPES,
          default: meta.repoType === "unknown" ? "frontend" : meta.repoType,
        },
        {
          type: "confirm",
          name: "confirmStack",
          message: `Use detected frameworks (${meta.frameworks.map((f) => f.id).join(", ") || "none"})?`,
          default: true,
        },
        {
          type: "checkbox",
          name: "agents",
          message: "Select subagents (recommendations pre-checked):",
          choices: ALL_AGENTS.map((id) => ({ name: id, value: id, checked: recommendAgents(meta).includes(id) })),
        },
        {
          type: "checkbox",
          name: "mcp",
          message: "Enable MCP servers:",
          choices: ALL_MCP.map((id) => ({ name: id, value: id, checked: id === "filesystem" })),
        },
        {
          type: "checkbox",
          name: "hooks",
          message: "Select hooks:",
          choices: ALL_HOOKS.map((id) => ({
            name: id,
            value: id,
            checked: id === "lint" || id === "typecheck",
          })),
        },
        {
          type: "checkbox",
          name: "commands",
          message: "Select command packs:",
          choices: ALL_COMMANDS.map((id) => ({
            name: id,
            value: id,
            checked: ["feature", "bugfix", "review"].includes(id),
          })),
        },
        {
          type: "checkbox",
          name: "skills",
          message: "Select skill packs:",
          choices: ALL_SKILLS.map((id) => ({
            name: id,
            value: id,
            checked: recommendSkills(meta).includes(id),
          })),
        },
      ]);

  meta.repoType = answers.repoType;

  // ---- Generate ----------------------------------------------------------
  ui.title("Generating workspace");
  const gen = ora("Writing files…").start();
  try {
    const rootFiles = await generateRootFiles(root, meta);
    const projJson = await generateProjectJson(root, meta);
    const agents = await generateAgents(root, answers.agents);
    const commands = await generateCommands(root, answers.commands);
    const hooks = await generateHooks(root, meta, answers.hooks);
    const skills = await generateSkills(root, answers.skills);
    const mcp = answers.mcp.length > 0 ? [await generateMcp(root, answers.mcp)] : [];
    const knowledge = await generateKnowledge(root, meta);

    const total =
      rootFiles.length + 1 + agents.length + commands.length + hooks.length + skills.length + mcp.length + knowledge.length;
    gen.succeed(`Wrote ${total} files`);

    ui.blank();
    ui.ok("Workspace ready.");
    ui.info("Next: open the repo in Claude Code. Try a slash command from .claude/commands/.");
    ui.info(`Re-run anytime: ${chalkCmd("npx claude-bootstrap sync")}`);
  } catch (err) {
    gen.fail("Generation failed");
    throw err;
  }
}

function chalkCmd(s: string): string {
  // Avoid importing chalk here; ui.info already styles. Return plain.
  return s;
}

function printDetection(meta: ProjectMetadata) {
  ui.blank();
  ui.info(`Repo type guess: ${meta.repoType}`);
  ui.info(`Frameworks: ${meta.frameworks.map((f) => f.id).join(", ") || "none"}`);
  ui.info(`Architecture: ${meta.architecture.style} (${meta.architecture.packageManager})`);
  ui.info(`Services: ${meta.services.length}`);
}

const ALL_AGENTS: AgentChoice[] = [
  "architect",
  "frontend",
  "backend",
  "database",
  "qa",
  "review",
  "security",
  "devops",
  "performance",
  "accessibility",
  "product",
];
const ALL_MCP: McpChoice[] = [
  "filesystem",
  "github",
  "postgres",
  "playwright",
  "slack",
  "jira",
  "redis",
  "kafka",
];
const ALL_HOOKS: HookChoice[] = [
  "typecheck",
  "lint",
  "unit-tests",
  "security-scan",
  "format",
  "build",
  "pr-validation",
  "architecture-validation",
];
const ALL_COMMANDS: CommandPack[] = [
  "feature",
  "bugfix",
  "refactor",
  "review",
  "api",
  "database",
  "ui",
  "testing",
  "documentation",
];
const ALL_SKILLS: SkillPack[] = [
  "react",
  "next",
  "typescript",
  "node",
  "nest",
  "express",
  "postgres",
  "mongo",
  "testing",
  "devops",
  "docker",
  "kubernetes",
  "microservices",
];

function defaultAnswers(meta: ProjectMetadata) {
  return {
    repoType: meta.repoType === "unknown" ? ("frontend" as RepoType) : meta.repoType,
    confirmStack: true,
    agents: recommendAgents(meta),
    mcp: ["filesystem"] as McpChoice[],
    hooks: ["typecheck", "lint"] as HookChoice[],
    commands: ["feature", "bugfix", "review"] as CommandPack[],
    skills: recommendSkills(meta),
  };
}
