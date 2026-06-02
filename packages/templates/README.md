# @claude-bootstrap/templates

Inline string templates with a tiny `{{var}}` renderer. Used by `@claude-bootstrap/generators`.

```ts
import { render, CLAUDE_MD } from "@claude-bootstrap/templates";
const md = render(CLAUDE_MD, { projectName: "acme", repoType: "fullstack" });
```

Why strings, not files: templates ship inside the published tarball and survive any bundler without a runtime asset resolver.
