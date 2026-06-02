# @claude-bootstrap/scanner

Core engine. Scans a repository and produces a `ProjectMetadata` object that every other package consumes.

```ts
import { scan } from "@claude-bootstrap/scanner";

const meta = await scan(process.cwd());
console.log(meta.frameworks, meta.repoType);
```

Detectors:
- `frameworks` — React, Next, Vite, Vue, Svelte, NestJS, Express, Fastify, Prisma, Drizzle, TypeORM, Tailwind, shadcn, TanStack Start, Remix
- `architecture` — monorepo tool, package manager, Docker/K8s/CI, tests
- `services` — workspace packages, classified as api/worker/frontend/shared
- `folders` + `languages` — top-level layout summary

The output is intentionally a plain JSON shape — easy to cache to `.ai/project.json` and re-use in `analyze` / `sync` / `doctor`.
