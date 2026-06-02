import path from "node:path";
import { detectFrameworks } from "./detectors/frameworks.js";
import { detectArchitecture } from "./detectors/architecture.js";
import { detectServices } from "./detectors/services.js";
import { detectFolders, detectLanguages } from "./detectors/folders.js";
import { allDeps, readPackageJson } from "./utils.js";
import type { ProjectMetadata, RepoType } from "./types.js";

export * from "./types.js";

function inferRepoType(meta: Omit<ProjectMetadata, "repoType">): RepoType {
  const ids = new Set(meta.frameworks.map((f) => f.id));
  const hasFrontend = ids.has("react") || ids.has("next") || ids.has("vue") || ids.has("svelte");
  const hasBackend = ids.has("nest") || ids.has("express") || ids.has("fastify");

  if (meta.architecture.style === "microservices" || meta.services.length > 3) return "microservices";
  if (meta.architecture.monorepoTool && meta.services.length > 1) return "monorepo";
  if (hasFrontend && hasBackend) return "fullstack";
  if (hasFrontend) return "frontend";
  if (hasBackend) return "backend";
  return "unknown";
}

/**
 * Scan a repository and produce ProjectMetadata.
 * All downstream generators consume this object — keep it stable.
 */
export async function scan(root: string): Promise<ProjectMetadata> {
  const abs = path.resolve(root);
  const [frameworks, architecture, services, folders, languages, pkg] = await Promise.all([
    detectFrameworks(abs),
    detectArchitecture(abs),
    detectServices(abs),
    detectFolders(abs),
    detectLanguages(abs),
    readPackageJson(abs),
  ]);

  const partial = {
    root: abs,
    frameworks,
    libraries: allDeps(pkg),
    services,
    architecture,
    folders,
    languages,
    scannedAt: new Date().toISOString(),
  } satisfies Omit<ProjectMetadata, "repoType">;

  return { ...partial, repoType: inferRepoType(partial) };
}
