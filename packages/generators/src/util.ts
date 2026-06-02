import { promises as fs } from "node:fs";
import path from "node:path";

export interface WriteOptions {
  /** If the file already exists, leave it alone. Defaults to false (overwrite). */
  preserve?: boolean;
  /** Make the file executable (chmod +x). For hook scripts. */
  executable?: boolean;
}

export async function writeFileSafe(
  filePath: string,
  contents: string,
  opts: WriteOptions = {},
): Promise<"written" | "preserved"> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  if (opts.preserve) {
    try {
      await fs.access(filePath);
      return "preserved";
    } catch {
      // not present — fall through to write
    }
  }
  await fs.writeFile(filePath, contents, "utf8");
  if (opts.executable) await fs.chmod(filePath, 0o755);
  return "written";
}

export type AgentChoice =
  | "architect"
  | "frontend"
  | "backend"
  | "database"
  | "qa"
  | "review"
  | "security"
  | "devops"
  | "performance"
  | "accessibility"
  | "product";

export type HookChoice =
  | "typecheck"
  | "lint"
  | "unit-tests"
  | "security-scan"
  | "format"
  | "build"
  | "pr-validation"
  | "architecture-validation";

export type CommandPack =
  | "feature"
  | "bugfix"
  | "refactor"
  | "review"
  | "api"
  | "database"
  | "ui"
  | "testing"
  | "documentation";

export type SkillPack =
  | "react"
  | "next"
  | "typescript"
  | "node"
  | "nest"
  | "express"
  | "postgres"
  | "mongo"
  | "testing"
  | "devops"
  | "docker"
  | "kubernetes"
  | "microservices";

export type McpChoice =
  | "filesystem"
  | "github"
  | "postgres"
  | "playwright"
  | "slack"
  | "jira"
  | "redis"
  | "kafka";
