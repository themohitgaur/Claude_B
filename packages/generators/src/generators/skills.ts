import path from "node:path";
import { SKILL_MD, render } from "@claude-bootstrap/templates";
import { writeFileSafe, type SkillPack, type WriteOptions } from "../util.js";
import type { ProjectMetadata } from "@claude-bootstrap/scanner";

interface SkillDef {
  title: string;
  description: string;
  whenToUse: string;
  bestPractices: string[];
  patterns: string[];
  references: string[];
}

const SKILLS: Record<SkillPack, SkillDef> = {
  react: {
    title: "React",
    description: "Idiomatic React 18+ patterns.",
    whenToUse: "When writing or reviewing React components.",
    bestPractices: ["Prefer composition over inheritance", "Co-locate state", "Memoize judiciously"],
    patterns: ["Container/presentational split", "Custom hooks for shared logic"],
    references: ["https://react.dev"],
  },
  next: {
    title: "Next.js",
    description: "App Router conventions and server components.",
    whenToUse: "When working in a Next.js codebase.",
    bestPractices: ["Default to server components", "Use route handlers for APIs"],
    patterns: ["Streaming + Suspense", "Server actions for mutations"],
    references: ["https://nextjs.org/docs"],
  },
  typescript: {
    title: "TypeScript",
    description: "Strict TypeScript patterns.",
    whenToUse: "Everywhere — strict mode is assumed.",
    bestPractices: ["No `any`", "Prefer `unknown` then narrow", "Discriminated unions for state"],
    patterns: ["Branded types for IDs", "Zod for runtime validation"],
    references: ["https://www.typescriptlang.org/docs"],
  },
  node: {
    title: "Node.js",
    description: "Node 20+ patterns.",
    whenToUse: "Server-side JS/TS code.",
    bestPractices: ["Use AbortController", "Stream large payloads", "Never block the event loop"],
    patterns: ["Graceful shutdown", "Structured logging"],
    references: ["https://nodejs.org/docs"],
  },
  nest: {
    title: "NestJS",
    description: "Module/provider/controller idioms.",
    whenToUse: "NestJS projects.",
    bestPractices: ["DI for testability", "DTOs + class-validator", "Guards for auth"],
    patterns: ["Feature modules", "Repository pattern"],
    references: ["https://docs.nestjs.com"],
  },
  express: {
    title: "Express",
    description: "Minimal middleware patterns.",
    whenToUse: "Express services.",
    bestPractices: ["Centralized error handler", "Validate inputs"],
    patterns: ["Router per resource"],
    references: ["https://expressjs.com"],
  },
  postgres: {
    title: "PostgreSQL",
    description: "Postgres schema + query patterns.",
    whenToUse: "Postgres-backed services.",
    bestPractices: ["Indexes match query shapes", "Use transactions for multi-row writes"],
    patterns: ["UUID PKs", "Soft deletes via deleted_at"],
    references: ["https://www.postgresql.org/docs"],
  },
  mongo: {
    title: "MongoDB",
    description: "Mongo document patterns.",
    whenToUse: "Mongo-backed services.",
    bestPractices: ["Model for query, not normalization", "Cap document size"],
    patterns: ["Bucket pattern for time-series"],
    references: ["https://www.mongodb.com/docs"],
  },
  testing: {
    title: "Testing",
    description: "Unit → integration → e2e ladder.",
    whenToUse: "Anytime you change behavior.",
    bestPractices: ["AAA structure", "One assertion per test when practical"],
    patterns: ["Test data builders", "Fixtures over mocks"],
    references: ["https://vitest.dev"],
  },
  devops: {
    title: "DevOps",
    description: "CI/CD and infra patterns.",
    whenToUse: "Pipeline or infra changes.",
    bestPractices: ["Reproducible builds", "Immutable infra"],
    patterns: ["Trunk-based + short-lived branches"],
    references: ["https://12factor.net"],
  },
  docker: {
    title: "Docker",
    description: "Image and Compose patterns.",
    whenToUse: "Container changes.",
    bestPractices: ["Multi-stage builds", "Pin base image digests"],
    patterns: ["Distroless runtime", ".dockerignore everything"],
    references: ["https://docs.docker.com"],
  },
  kubernetes: {
    title: "Kubernetes",
    description: "Workload patterns.",
    whenToUse: "K8s manifests / Helm charts.",
    bestPractices: ["Resource requests + limits", "Liveness/readiness probes"],
    patterns: ["Deployment + Service + Ingress", "ConfigMap for non-secrets"],
    references: ["https://kubernetes.io/docs"],
  },
  microservices: {
    title: "Microservices",
    description: "Service boundary patterns.",
    whenToUse: "Cross-service work.",
    bestPractices: ["One DB per service", "Event-first for cross-service writes"],
    patterns: ["Outbox", "Saga"],
    references: ["https://microservices.io"],
  },
};

export function recommendSkills(meta: ProjectMetadata): SkillPack[] {
  const ids = new Set(meta.frameworks.map((f) => f.id));
  const recs = new Set<SkillPack>(["typescript", "testing"]);
  if (ids.has("react") || ids.has("next")) recs.add("react");
  if (ids.has("next")) recs.add("next");
  if (ids.has("nest")) recs.add("nest");
  if (ids.has("express")) recs.add("express");
  if (Object.keys(meta.libraries).some((l) => l.includes("pg") || l.includes("postgres"))) {
    recs.add("postgres");
  }
  if (meta.architecture.hasDocker) recs.add("docker");
  if (meta.architecture.hasKubernetes) recs.add("kubernetes");
  if (meta.architecture.style === "microservices") recs.add("microservices");
  return [...recs];
}

export async function generateSkills(
  root: string,
  picks: SkillPack[],
  opts: WriteOptions = {},
): Promise<string[]> {
  const written: string[] = [];
  for (const id of picks) {
    const def = SKILLS[id];
    const md = render(SKILL_MD, {
      name: id,
      title: def.title,
      description: def.description,
      whenToUse: def.whenToUse,
      bestPractices: def.bestPractices.map((b) => `- ${b}`).join("\n"),
      patterns: def.patterns.map((p) => `- ${p}`).join("\n"),
      references: def.references.map((r) => `- ${r}`).join("\n"),
    });
    const file = path.join(root, ".claude", "skills", id, "SKILL.md");
    await writeFileSafe(file, md, opts);
    written.push(file);
  }
  return written;
}
