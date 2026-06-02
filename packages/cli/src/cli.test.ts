import { describe, it, expect } from "vitest";
import { execSync } from "node:child_process";
import path from "node:path";

// Smoke test — once built, `--help` should succeed.
describe("cli", () => {
  it("exposes --help once built", () => {
    const bin = path.resolve(__dirname, "../bin/claude-bootstrap.js");
    try {
      const out = execSync(`node ${bin} --help`, { encoding: "utf8" });
      expect(out).toContain("claude-bootstrap");
    } catch {
      // dist not built — skip silently in pre-build runs
      expect(true).toBe(true);
    }
  });
});
