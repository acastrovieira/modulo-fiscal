import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const apiRouteFiles = [
  "src/app/api/audit-events/route.ts",
  "src/app/api/audit-events/[id]/route.ts",
  "src/app/api/batches/route.ts",
  "src/app/api/batches/[id]/route.ts",
  "src/app/api/batches/[id]/submit-review/route.ts",
  "src/app/api/batches/[id]/simulate/route.ts",
  "src/app/api/batches/[id]/approve-future-issuance/route.ts",
  "src/app/api/batches/[id]/cancel/route.ts",
  "src/app/api/candidates/route.ts",
  "src/app/api/candidates/[id]/route.ts",
  "src/app/api/candidates/[id]/ready-for-batch/route.ts",
  "src/app/api/documents/route.ts",
  "src/app/api/documents/[id]/route.ts",
  "src/app/api/documents/[id]/download-intent/route.ts",
  "src/app/api/imports/route.ts",
  "src/app/api/imports/[id]/route.ts",
  "src/app/api/imports/[id]/validate/route.ts",
  "src/app/api/imports/[id]/candidates/route.ts",
  "src/app/api/inconsistencies/route.ts",
  "src/app/api/inconsistencies/[id]/route.ts",
  "src/app/api/inconsistencies/[id]/resolve/route.ts",
  "src/app/api/inconsistencies/[id]/waive/route.ts",
  "src/app/api/fiscal/simulation/documents/route.ts",
  "src/app/api/fiscal/simulation/documents/[id]/validate/route.ts",
  "src/app/api/fiscal/simulation/documents/[id]/simulate-issue/route.ts",
  "src/app/api/fiscal/simulation/documents/[id]/scenario-evaluation/route.ts",
  "src/app/api/fiscal/simulation/documents/[id]/void/route.ts",
  "src/app/api/fiscal/simulation/profile/route.ts",
  "src/app/api/fiscal/simulation/takers/route.ts",
  "src/app/api/observability/fiscal-governance/route.ts",
  "src/app/api/tenant/members/route.ts",
  "src/app/api/tenant/members/[id]/suspend/route.ts",
  "src/app/api/tenant/invites/route.ts",
  "src/app/api/tenant/invites/[id]/resend/route.ts",
  "src/app/api/tenant/invites/[id]/revoke/route.ts"
];

function readProjectFile(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("tenant isolation abuse guardrails", () => {
  it("sanitizes Supabase callback redirects to local paths only", () => {
    const content = readProjectFile("src/app/auth/callback/route.ts");

    expect(content).toContain("safeRedirectPath");
    expect(content).toContain("value.startsWith(\"/\")");
    expect(content).toContain("value.startsWith(\"//\")");
    expect(content).not.toContain("const next = requestUrl.searchParams.get(\"next\") ??");
  });

  it("keeps tenant selection out of client-controlled route inputs", () => {
    for (const file of apiRouteFiles) {
      const content = readProjectFile(file);

      expect(content, file).not.toMatch(/searchParams\.get\(["']tenantId["']\)/);
      expect(content, file).not.toMatch(/headers\.get\(["']x-tenant-id["']\)/i);
      expect(content, file).not.toMatch(/\bbody\.tenantId\b/);
      expect(content, file).not.toMatch(/\bparams\.tenantId\b/);
    }
  });

  it("requires backend command context on mutating operational routes", () => {
    const mutatingRoutes = apiRouteFiles.filter((file) => !file.endsWith("/route.ts") || !file.includes("[id]"));

    for (const file of mutatingRoutes) {
      const content = readProjectFile(file);
      if (!content.includes("export async function POST") && !content.includes("export async function PATCH")) {
        continue;
      }

      expect(content, file).toContain("createCommandContext");
    }
  });
});
