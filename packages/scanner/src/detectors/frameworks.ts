import path from "node:path";
import { allDeps, pathExists, readPackageJson } from "../utils.js";
import type { DetectedFramework, FrameworkId } from "../types.js";

interface Rule {
  id: FrameworkId;
  dep?: string[]; // any of these deps proves it
  file?: string[]; // any of these files proves it
}

const RULES: Rule[] = [
  { id: "next", dep: ["next"], file: ["next.config.js", "next.config.mjs", "next.config.ts"] },
  { id: "tanstack-start", dep: ["@tanstack/react-start", "@tanstack/start"] },
  { id: "remix", dep: ["@remix-run/react"] },
  { id: "react", dep: ["react"] },
  { id: "vue", dep: ["vue"] },
  { id: "svelte", dep: ["svelte"] },
  { id: "vite", dep: ["vite"], file: ["vite.config.ts", "vite.config.js"] },
  { id: "nest", dep: ["@nestjs/core"], file: ["nest-cli.json"] },
  { id: "express", dep: ["express"] },
  { id: "fastify", dep: ["fastify"] },
  { id: "prisma", dep: ["@prisma/client", "prisma"], file: ["prisma/schema.prisma"] },
  { id: "drizzle", dep: ["drizzle-orm"] },
  { id: "typeorm", dep: ["typeorm"] },
  { id: "tailwind", dep: ["tailwindcss"] },
  { id: "shadcn", file: ["components.json"] },
];

export async function detectFrameworks(root: string): Promise<DetectedFramework[]> {
  const pkg = await readPackageJson(root);
  const deps = allDeps(pkg);
  const found: DetectedFramework[] = [];

  for (const rule of RULES) {
    const evidence: string[] = [];
    let version: string | undefined;

    if (rule.dep) {
      for (const d of rule.dep) {
        if (deps[d]) {
          evidence.push(`package.json:${d}`);
          version ??= deps[d];
        }
      }
    }
    if (rule.file) {
      for (const f of rule.file) {
        if (await pathExists(path.join(root, f))) evidence.push(f);
      }
    }
    if (evidence.length > 0) {
      // confidence: more evidence -> higher, capped at 1.0
      const confidence = Math.min(1, 0.5 + evidence.length * 0.2);
      found.push({ id: rule.id, version, confidence, evidence });
    }
  }

  return found.sort((a, b) => b.confidence - a.confidence);
}
