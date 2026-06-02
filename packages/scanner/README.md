# @themohitgaur1/scanner

Core engine. Scans a repository and produces a `ProjectMetadata` object that every other package consumes.

```ts
import { scan } from "@themohitgaur1/scanner";

const meta = await scan(process.cwd());
console.log(meta.frameworks, meta.repoType);
```

Detectors:
- `frameworks`  EReact, Next, Vite, Vue, Svelte, NestJS, Express, Fastify, Prisma, Drizzle, TypeORM, Tailwind, shadcn, TanStack Start, Remix
- `architecture`  Emonorepo tool, package manager, Docker/K8s/CI, tests
- `services`  Eworkspace packages, classified as api/worker/frontend/shared
- `folders` + `languages`  Etop-level layout summary

The output is intentionally a plain JSON shape  Eeasy to cache to `.ai/project.json` and re-use in `analyze` / `sync` / `doctor`.
