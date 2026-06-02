import { describe, it, expect } from "vitest";
import { scan } from "../src/index.js";
import path from "node:path";
import { promises as fs } from "node:fs";
import os from "node:os";

describe("scanner", () => {
  it("scans an empty repo without throwing", async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "cb-scan-"));
    await fs.writeFile(
      path.join(tmp, "package.json"),
      JSON.stringify({ name: "demo", dependencies: { react: "^18.0.0" } }),
    );
    const meta = await scan(tmp);
    expect(meta.frameworks.some((f) => f.id === "react")).toBe(true);
    expect(meta.repoType).toBe("frontend");
  });
});
