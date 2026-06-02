import path from "node:path";
import type { ProjectMetadata } from "@claude-bootstrap/scanner";
import { AGENT_MD, render } from "@claude-bootstrap/templates";
import { writeFileSafe, type AgentChoice, type WriteOptions } from "../util.js";

interface AgentDef {
  name: string;
  title: string;
  description: string;
  role: string;
  responsibilities: string[];
  tools: string[];
}

const DEFS: Record<AgentChoice, AgentDef> = {
  architect: {
    name: "architect",
    title: "Architect Agent",
    description: "Designs features, enforces patterns, gates architectural changes.",
    role: "Senior architect responsible for system design and pattern consistency.",
    responsibilities: ["Feature planning", "Architecture decisions", "Pattern enforcement"],
    tools: ["Read", "Grep", "Glob"],
  },
  frontend: {
    name: "frontend",
    title: "Frontend Agent",
    description: "Implements UI components, screens, and client-side state.",
    role: "Senior frontend engineer fluent in the project's UI framework.",
    responsibilities: ["UI components", "Routing & state", "Accessibility"],
    tools: ["Read", "Write", "Edit", "Bash"],
  },
  backend: {
    name: "backend",
    title: "Backend Agent",
    description: "Implements APIs, services, and server-side business logic.",
    role: "Senior backend engineer for the project's server stack.",
    responsibilities: ["API endpoints", "Business logic", "Service integration"],
    tools: ["Read", "Write", "Edit", "Bash"],
  },
  database: {
    name: "database",
    title: "Database Agent",
    description: "Owns schema, migrations, indexes, and query performance.",
    role: "Database engineer focused on data modelling and performance.",
    responsibilities: ["Schema design", "Migrations", "Query optimization"],
    tools: ["Read", "Write", "Edit", "Bash"],
  },
  qa: {
    name: "qa",
    title: "QA Agent",
    description: "Writes and maintains unit, integration, and e2e tests.",
    role: "QA engineer responsible for coverage and regression safety.",
    responsibilities: ["Test cases", "Coverage gates", "Regression runs"],
    tools: ["Read", "Write", "Edit", "Bash"],
  },
  review: {
    name: "review",
    title: "Code Review Agent",
    description: "Reviews diffs for quality, standards, and architecture compliance.",
    role: "Senior reviewer enforcing coding standards.",
    responsibilities: ["Code quality", "Standards", "Architecture compliance"],
    tools: ["Read", "Grep", "Glob"],
  },
  security: {
    name: "security",
    title: "Security Agent",
    description: "OWASP audits, dependency scans, secret reviews.",
    role: "Security engineer focused on application hardening.",
    responsibilities: ["OWASP checks", "Dependency audit", "Secret hygiene"],
    tools: ["Read", "Grep", "Bash"],
  },
  devops: {
    name: "devops",
    title: "DevOps Agent",
    description: "CI, Docker, deployment, infra configuration.",
    role: "Platform engineer owning build, ship, and run.",
    responsibilities: ["CI pipelines", "Docker/K8s", "Deployment"],
    tools: ["Read", "Write", "Edit", "Bash"],
  },
  performance: {
    name: "performance",
    title: "Performance Agent",
    description: "Profiling, caching, load testing, and tuning.",
    role: "Performance engineer focused on latency and throughput.",
    responsibilities: ["Profiling", "Caching", "Load tests"],
    tools: ["Read", "Bash"],
  },
  accessibility: {
    name: "accessibility",
    title: "Accessibility Agent",
    description: "WCAG audits, keyboard nav, screen-reader compatibility.",
    role: "A11y specialist ensuring inclusive UI.",
    responsibilities: ["WCAG audits", "Keyboard navigation", "ARIA"],
    tools: ["Read", "Grep"],
  },
  product: {
    name: "product",
    title: "Product Manager Agent",
    description: "Breaks down features into shippable increments and acceptance criteria.",
    role: "Product manager bridging spec and implementation.",
    responsibilities: ["Spec breakdown", "Acceptance criteria", "Prioritization"],
    tools: ["Read"],
  },
};

/**
 * Generate subagents from detected architecture. We always tailor a subset
 * to what was detected (e.g. skip `database` if no DB libs found) but still
 * honor explicit user picks.
 */
export function recommendAgents(meta: ProjectMetadata): AgentChoice[] {
  const ids = new Set(meta.frameworks.map((f) => f.id));
  const recs = new Set<AgentChoice>(["architect", "qa", "review", "security"]);
  if (ids.has("react") || ids.has("next") || ids.has("vue") || ids.has("svelte")) {
    recs.add("frontend");
    recs.add("accessibility");
  }
  if (ids.has("nest") || ids.has("express") || ids.has("fastify")) recs.add("backend");
  if (ids.has("prisma") || ids.has("drizzle") || ids.has("typeorm")) recs.add("database");
  if (meta.architecture.hasDocker || meta.architecture.hasKubernetes || meta.architecture.hasCi) {
    recs.add("devops");
  }
  if (meta.architecture.style === "microservices") recs.add("performance");
  return [...recs];
}

export async function generateAgents(
  root: string,
  choices: AgentChoice[],
  opts: WriteOptions = {},
): Promise<string[]> {
  const written: string[] = [];
  for (const id of choices) {
    const def = DEFS[id];
    const md = render(AGENT_MD, {
      name: def.name,
      title: def.title,
      description: def.description,
      role: def.role,
      responsibilities: def.responsibilities.map((r) => `- ${r}`).join("\n"),
      tools: def.tools.join(", "),
    });
    const file = path.join(root, ".claude", "agents", `${def.name}.md`);
    await writeFileSafe(file, md, opts);
    written.push(file);
  }
  return written;
}
