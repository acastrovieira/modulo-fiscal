import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = process.cwd();
const ignoredDirectories = new Set([".git", ".next", ".aiox-core", ".npm-cache", "coverage", "dist", "external", "node_modules", "out"]);
const ignoredFiles = new Set(["package-lock.json"]);
const textExtensions = new Set([".css", ".env", ".example", ".html", ".js", ".json", ".md", ".mjs", ".prisma", ".sql", ".ts", ".tsx", ".txt", ".yml"]);
const maxBytes = 1024 * 1024;

const secretPatterns = [
  {
    code: "private-key",
    pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/
  },
  {
    code: "google-service-account-private-key",
    pattern: /"type"\s*:\s*"service_account"[\s\S]{0,1200}"private_key"\s*:\s*"/i
  },
  {
    code: "supabase-service-role-key",
    pattern: /SUPABASE_SERVICE_ROLE_KEY\s*[:=]\s*["']?[A-Za-z0-9._-]{20,}/i
  },
  {
    code: "supabase-secrets-set-command",
    pattern: new RegExp(["supabase", "secrets", "set"].join("\\s+"), "i")
  }
];

function isTextFile(filePath) {
  const extension = extname(filePath).toLowerCase();
  return textExtensions.has(extension) || filePath.endsWith(".env.example");
}

function listFiles(directory = root) {
  const output = [];

  for (const entry of readdirSync(directory)) {
    const absolute = join(directory, entry);
    const relativePath = relative(root, absolute).replaceAll("\\", "/");
    const stat = statSync(absolute);

    if (stat.isDirectory()) {
      if (!ignoredDirectories.has(entry)) {
        output.push(...listFiles(absolute));
      }
      continue;
    }

    if (!ignoredFiles.has(entry) && stat.size <= maxBytes && isTextFile(relativePath)) {
      output.push(relativePath);
    }
  }

  return output;
}

export function findSecretFindingsInContent(filePath, content) {
  return secretPatterns
    .filter((definition) => definition.pattern.test(content))
    .map((definition) => ({ filePath, code: definition.code }));
}

export function findSecretFindings() {
  return listFiles().flatMap((filePath) => {
    const content = readFileSync(join(root, filePath), "utf8");
    return findSecretFindingsInContent(filePath, content);
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const findings = findSecretFindings();

  if (findings.length > 0) {
    console.error("Potential secrets found. Remove them from the repository and rotate exposed credentials:");
    for (const finding of findings) {
      console.error(`- ${finding.filePath}: ${finding.code}`);
    }
    process.exit(1);
  }

  console.log("No potential secrets found.");
}
