import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const sourceRoots = ["src", "tests"];
const textExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".md", ".mjs", ".json", ".prisma"]);
const allowedProviderMentions = [
  "docs/",
  "tests/",
  "src/modules/fiscal/application/fiscal-batch-service.ts",
  "src/modules/operational/application/dashboard-metrics.ts",
  "src/modules/operational/presentation/operational-cockpit.tsx",
  "src/shared/security/roles.ts",
  "src/shared/security/command-permissions.ts"
];

function listFiles(dir: string): string[] {
  const output: string[] = [];

  for (const entry of readdirSync(join(root, dir))) {
    const absolute = join(root, dir, entry);
    const stat = statSync(absolute);
    if (stat.isDirectory()) {
      if (["node_modules", ".next", ".git", "external", ".aiox-core"].includes(entry)) {
        continue;
      }
      output.push(...listFiles(relative(root, absolute)));
      continue;
    }

    const extension = entry.slice(entry.lastIndexOf("."));
    if (textExtensions.has(extension)) {
      output.push(relative(root, absolute).replaceAll("\\", "/"));
    }
  }

  return output;
}

function readProjectFile(file: string): string {
  return readFileSync(join(root, file), "utf8");
}

describe("MVP hardening guardrails", () => {
  it("keeps Prisma out of React UI and presentation components", () => {
    const uiFiles = listFiles("src").filter((file) =>
      file.startsWith("src/components/") || file.includes("/presentation/") || file.includes("src/app/(dashboard)/")
    );

    const offenders = uiFiles.filter((file) => /@prisma\/client|PrismaClient|shared\/database|\bprisma\b/.test(readProjectFile(file)));

    expect(offenders).toEqual([]);
  });

  it("does not introduce real NFS-e providers, scraping clients or external fiscal jobs in source code", () => {
    const files = sourceRoots.flatMap(listFiles);
    const forbiddenPatterns = [
      /playwright|puppeteer|selenium|crawler|cheerio/i,
      /prefeitura|sefaz|municipal.*endpoint/i,
      /nfse.*adapter|adapter.*nfse|provider.*nfse/i,
      /pg-boss|boss\.send|queue\.send/i,
      /invoice_request|issued_at|emitted_at/i
    ];
    const offenders: string[] = [];

    for (const file of files) {
      if (allowedProviderMentions.some((allowed) => file.startsWith(allowed))) {
        continue;
      }

      const content = readProjectFile(file);
      if (forbiddenPatterns.some((pattern) => pattern.test(content))) {
        offenders.push(file);
      }
    }

    expect(offenders).toEqual([]);
  });

  it("keeps public API errors sanitized with requestId and without stack or SQL details", () => {
    const content = readProjectFile("src/shared/http/api-error-response.ts");

    expect(content).toContain("requestId");
    expect(content).not.toMatch(/stack|sql|constraint|Prisma/i);
    expect(content).toContain("Unexpected server error.");
  });

  it("does not expose full CPF/CNPJ-like test documents through operational cockpit DTOs", () => {
    const files = [
      "src/modules/operational/domain/operational-metric.ts",
      "src/modules/operational/application/dashboard-metrics.ts",
      "src/modules/operational/presentation/operational-cockpit.tsx",
      "src/app/api/operations/summary/route.ts"
    ];
    const offenders = files.filter((file) => /customerDocument|documentNumber|cpf|cnpj|email|phone/i.test(readProjectFile(file)));

    expect(offenders).toEqual([]);
  });

  it("documents LGPD-sensitive access events for future audit.view and documents.download routes", () => {
    const roles = readProjectFile("src/shared/security/roles.ts");
    const plan = readProjectFile("docs/product/execution-plan-mvp-fiscal.md");

    expect(roles).toContain("audit.view");
    expect(roles).toContain("documents.download");
    expect(plan).toContain("Validar que `audit.view` controla acesso a eventos.");
    expect(plan).toContain("Validar que `documents.download` controla acesso a documentos.");
  });
});
