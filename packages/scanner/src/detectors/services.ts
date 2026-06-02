import path from "node:path";
import fg from "fast-glob";
import { pathExists, readJsonSafe, readPackageJson } from "../utils.js";
import type { DetectedService } from "../types.js";

/**
 * Detects services for monorepos / microservice layouts.
 * Falls back to a single "root" service for plain repos.
 */
export async function detectServices(root: string): Promise<DetectedService[]> {
  const pkg = await readPackageJson(root);
  const patterns: string[] = [];

  if (pkg?.workspaces) {
    const ws = Array.isArray(pkg.workspaces) ? pkg.workspaces : (pkg.workspaces.packages ?? []);
    patterns.push(...ws);
  }
  if (await pathExists(path.join(root, "pnpm-workspace.yaml"))) {
    patterns.push("packages/*", "apps/*", "services/*");
  }
  if (await pathExists(path.join(root, "services"))) patterns.push("services/*");
  if (await pathExists(path.join(root, "apps"))) patterns.push("apps/*");

  if (patterns.length === 0) {
    return [
      {
        name: pkg?.name ?? path.basename(root),
        path: ".",
        kind: "unknown",
        language: "ts",
      },
    ];
  }

  const dirs = await fg(patterns, { cwd: root, onlyDirectories: true, deep: 2 });
  const services: DetectedService[] = [];
  for (const dir of dirs) {
    const sub = await readJsonSafe<{ name?: string; dependencies?: Record<string, string> }>(
      path.join(root, dir, "package.json"),
    );
    const deps = { ...(sub?.dependencies ?? {}) };
    const kind: DetectedService["kind"] = deps["@nestjs/core"] || deps["express"] || deps["fastify"]
      ? "api"
      : deps["react"] || deps["next"] || deps["vue"]
        ? "frontend"
        : deps["bullmq"] || deps["bull"] || deps["kafkajs"]
          ? "worker"
          : "shared";
    services.push({
      name: sub?.name ?? path.basename(dir),
      path: dir,
      kind,
      language: "ts",
    });
  }
  return services;
}
