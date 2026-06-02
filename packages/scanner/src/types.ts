/**
 * Shared types for the Scanner + Context Engine.
 *
 * Everything generated downstream (agents, hooks, skills, MCP, knowledge)
 * derives from `ProjectMetadata`. Treat this as the contract.
 */

export type RepoType =
  | "frontend"
  | "backend"
  | "fullstack"
  | "microservices"
  | "monorepo"
  | "unknown";

export type FrameworkId =
  | "react"
  | "next"
  | "vite"
  | "vue"
  | "svelte"
  | "nest"
  | "express"
  | "fastify"
  | "tanstack-start"
  | "remix"
  | "prisma"
  | "drizzle"
  | "typeorm"
  | "tailwind"
  | "shadcn";

export interface DetectedFramework {
  id: FrameworkId;
  version?: string;
  confidence: number; // 0..1
  evidence: string[]; // file paths / package names that proved it
}

export interface DetectedService {
  name: string;
  path: string;
  kind: "api" | "worker" | "frontend" | "shared" | "unknown";
  language: "ts" | "js" | "go" | "python" | "unknown";
}

export interface DetectedArchitecture {
  style:
    | "layered"
    | "hexagonal"
    | "clean"
    | "mvc"
    | "feature-sliced"
    | "microservices"
    | "monolith"
    | "unknown";
  hasTests: boolean;
  hasCi: boolean;
  hasDocker: boolean;
  hasKubernetes: boolean;
  packageManager: "npm" | "pnpm" | "yarn" | "bun" | "unknown";
  monorepoTool?: "pnpm" | "turbo" | "nx" | "lerna" | "rush";
}

export interface ProjectMetadata {
  /** Absolute path to repository root. */
  root: string;
  /** Best-guess repo type — drives wizard defaults. */
  repoType: RepoType;
  /** Detected frameworks ordered by confidence desc. */
  frameworks: DetectedFramework[];
  /** All notable libraries from package.json (name + version). */
  libraries: Record<string, string>;
  /** Services (for monorepo/microservices); single entry for plain repos. */
  services: DetectedService[];
  architecture: DetectedArchitecture;
  /** Folder structure summary (top-level dirs + counts). */
  folders: Array<{ path: string; fileCount: number }>;
  /** Languages by file count. */
  languages: Record<string, number>;
  /** ISO timestamp of the scan. */
  scannedAt: string;
}
