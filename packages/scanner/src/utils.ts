import { promises as fs } from "node:fs";
import path from "node:path";

export async function readJsonSafe<T = unknown>(file: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function pathExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

export async function readPackageJson(root: string) {
  return readJsonSafe<{
    name?: string;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    workspaces?: string[] | { packages?: string[] };
    scripts?: Record<string, string>;
  }>(path.join(root, "package.json"));
}

export function allDeps(
  pkg: { dependencies?: Record<string, string>; devDependencies?: Record<string, string> } | null,
): Record<string, string> {
  if (!pkg) return {};
  return { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
}
