import path from "node:path";
import { pathExists, readPackageJson } from "../utils.js";
import type { DetectedArchitecture } from "../types.js";

export async function detectArchitecture(root: string): Promise<DetectedArchitecture> {
  const [hasDocker, hasCompose, hasK8s, hasCi, hasTests, hasPnpmWs, hasTurbo, hasNx, hasLerna] =
    await Promise.all([
      pathExists(path.join(root, "Dockerfile")),
      pathExists(path.join(root, "docker-compose.yml")),
      pathExists(path.join(root, "k8s")).then(
        async (v) => v || pathExists(path.join(root, "kubernetes")),
      ),
      pathExists(path.join(root, ".github/workflows")).then(
        async (v) => v || pathExists(path.join(root, ".gitlab-ci.yml")),
      ),
      pathExists(path.join(root, "tests")).then(
        async (v) => v || pathExists(path.join(root, "__tests__")),
      ),
      pathExists(path.join(root, "pnpm-workspace.yaml")),
      pathExists(path.join(root, "turbo.json")),
      pathExists(path.join(root, "nx.json")),
      pathExists(path.join(root, "lerna.json")),
    ]);

  const pkg = await readPackageJson(root);
  const packageManager: DetectedArchitecture["packageManager"] = (await pathExists(
    path.join(root, "pnpm-lock.yaml"),
  ))
    ? "pnpm"
    : (await pathExists(path.join(root, "yarn.lock")))
      ? "yarn"
      : (await pathExists(path.join(root, "bun.lockb"))) ||
          (await pathExists(path.join(root, "bun.lock")))
        ? "bun"
        : (await pathExists(path.join(root, "package-lock.json")))
          ? "npm"
          : "unknown";

  const monorepoTool = hasTurbo
    ? "turbo"
    : hasNx
      ? "nx"
      : hasLerna
        ? "lerna"
        : hasPnpmWs || !!pkg?.workspaces
          ? "pnpm"
          : undefined;

  // Crude style inference. Generators get richer signal from frameworks too.
  const style: DetectedArchitecture["style"] = monorepoTool
    ? hasK8s || hasCompose
      ? "microservices"
      : "feature-sliced"
    : "monolith";

  return {
    style,
    hasTests,
    hasCi,
    hasDocker: hasDocker || hasCompose,
    hasKubernetes: hasK8s,
    packageManager,
    monorepoTool,
  };
}
