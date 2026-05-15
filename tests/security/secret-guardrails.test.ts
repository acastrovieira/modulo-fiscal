import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

function readProjectFile(file: string): string {
  return readFileSync(file, "utf8");
}

describe("secret guardrails", () => {
  it("runs the repository secret scanner successfully", () => {
    const output = execFileSync("node", ["scripts/check-no-secrets.mjs"], { encoding: "utf8" });

    expect(output).toContain("No potential secrets found.");
  });

  it("blocks service-account and supabase secret command file patterns from git", () => {
    const gitignore = readProjectFile(".gitignore");

    expect(gitignore).toContain("*service-account*.json");
    expect(gitignore).toContain("*service_account*.json");
    expect(gitignore).toContain("*supabase*secrets*set*.txt");
  });

  it("keeps the scanner in CI quality gates", () => {
    const workflow = readProjectFile(".github/workflows/ci.yml");
    const scripts = readProjectFile("package.json");

    expect(scripts).toContain("\"security:secrets\"");
    expect(workflow).toContain("npm run security:secrets");
  });
});
