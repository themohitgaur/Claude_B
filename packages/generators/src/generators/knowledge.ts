import path from "node:path";
import { KNOWLEDGE_MD, render } from "@themohitgaur1/templates";
import { writeFileSafe, type WriteOptions } from "../util.js";
import type { ProjectMetadata } from "@themohitgaur1/scanner";

function topFrameworks(meta: ProjectMetadata): string {
  return meta.frameworks
    .slice(0, 6)
    .map((f) => `- **${f.id}**${f.version ? ` \`${f.version}\`` : ""}  Eevidence: ${f.evidence.join(", ")}`)
    .join("\n");
}

function topFolders(meta: ProjectMetadata): string {
  return meta.folders
    .slice(0, 10)
    .map((f) => `- \`${f.path}/\`  E${f.fileCount} files`)
    .join("\n");
}

function services(meta: ProjectMetadata): string {
  return meta.services.map((s) => `- **${s.name}** (\`${s.path}\`)  E${s.kind}`).join("\n");
}

export async function generateKnowledge(
  root: string,
  meta: ProjectMetadata,
  opts: WriteOptions = {},
): Promise<string[]> {
  const written: string[] = [];
  const dir = path.join(root, ".ai", "knowledge");

  const files: Array<{ name: string; title: string; subtitle: string; body: string }> = [
    {
      name: "ARCHITECTURE.md",
      title: "Architecture",
      subtitle: `Detected style: ${meta.architecture.style}`,
      body: `## Frameworks\n\n${topFrameworks(meta)}\n\n## Services\n\n${services(meta)}\n\n## Folder layout\n\n${topFolders(meta)}\n\n## Tooling\n\n- Package manager: ${meta.architecture.packageManager}\n- Monorepo tool: ${meta.architecture.monorepoTool ?? "none"}\n- Docker: ${meta.architecture.hasDocker}\n- Kubernetes: ${meta.architecture.hasKubernetes}\n- CI: ${meta.architecture.hasCi}\n- Tests: ${meta.architecture.hasTests}`,
    },
    {
      name: "AUTHENTICATION.md",
      title: "Authentication",
      subtitle: "How auth works in this project.",
      body: `_This file was scaffolded by claude-bootstrap. Fill in the specifics:_\n\n- Identity provider\n- Token format & lifetime\n- Refresh strategy\n- Authorization model (RBAC / ABAC)\n- Session storage`,
    },
    {
      name: "DATABASE.md",
      title: "Database",
      subtitle: "Schema, migrations, and access patterns.",
      body: `_Scaffolded. Document:_\n\n- Primary datastore(s)\n- Migration tool & workflow\n- Naming conventions\n- Indexing strategy\n- Backup / restore`,
    },
    {
      name: "API_GUIDELINES.md",
      title: "API Guidelines",
      subtitle: "Conventions for HTTP / RPC APIs.",
      body: `_Scaffolded. Document:_\n\n- URL & versioning scheme\n- Error envelope\n- Pagination\n- Auth headers\n- Idempotency`,
    },
    {
      name: "WORKFLOWS.md",
      title: "Workflows",
      subtitle: "How work moves through the team.",
      body: `_Scaffolded. Document:_\n\n- Branching\n- PR checklist\n- Release cadence\n- On-call`,
    },
    {
      name: "BUSINESS_RULES.md",
      title: "Business Rules",
      subtitle: "Non-obvious domain logic agents must respect.",
      body: `_Scaffolded. Add invariants agents would otherwise violate._`,
    },
  ];

  for (const f of files) {
    const md = render(KNOWLEDGE_MD, { title: f.title, subtitle: f.subtitle, body: f.body });
    const file = path.join(dir, f.name);
    await writeFileSafe(file, md, opts);
    written.push(file);
  }
  return written;
}

export async function generateProjectJson(
  root: string,
  meta: ProjectMetadata,
  opts: WriteOptions = {},
): Promise<string> {
  const file = path.join(root, ".ai", "project.json");
  await writeFileSafe(file, JSON.stringify(meta, null, 2), opts);
  return file;
}
