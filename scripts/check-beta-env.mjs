import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const allowedBetaEnvironments = new Set(["Staging", "Homologacao"]);
const requiredKeys = [
  "DATABASE_URL",
  "NEXT_PUBLIC_APP_ENV",
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "FEATURE_REAL_NFSE_ENABLED",
  "FEATURE_SCRAPING_ENABLED",
  "FEATURE_MUNICIPAL_PROVIDER_ENABLED"
];

function parseEnvContent(content) {
  const values = new Map();

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separator = line.indexOf("=");
    if (separator === -1) {
      continue;
    }

    const key = line.slice(0, separator).trim();
    const rawValue = line.slice(separator + 1).trim();
    const value = rawValue.replace(/^["']|["']$/g, "");
    values.set(key, value);
  }

  return values;
}

export function validateBetaEnvContent(content) {
  const values = parseEnvContent(content);
  const errors = [];

  for (const key of requiredKeys) {
    if (!values.has(key) || values.get(key) === "") {
      errors.push(`${key} is required for staging/beta validation.`);
    }
  }

  const appEnv = values.get("NEXT_PUBLIC_APP_ENV");
  if (appEnv && !allowedBetaEnvironments.has(appEnv)) {
    errors.push("NEXT_PUBLIC_APP_ENV must be Staging or Homologacao for staging/beta.");
  }

  const appUrl = values.get("NEXT_PUBLIC_APP_URL");
  if (appUrl && !/^https:\/\//.test(appUrl)) {
    errors.push("NEXT_PUBLIC_APP_URL must be an HTTPS URL for staging/beta.");
  }

  const databaseUrl = values.get("DATABASE_URL");
  if (databaseUrl && /localhost|127\.0\.0\.1/i.test(databaseUrl)) {
    errors.push("DATABASE_URL must not point to localhost for staging/beta.");
  }

  const directUrl = values.get("DIRECT_URL");
  if (directUrl && /localhost|127\.0\.0\.1/i.test(directUrl)) {
    errors.push("DIRECT_URL must not point to localhost for staging/beta.");
  }

  const supabaseUrl = values.get("NEXT_PUBLIC_SUPABASE_URL");
  if (supabaseUrl && !/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(supabaseUrl)) {
    errors.push("NEXT_PUBLIC_SUPABASE_URL must be a Supabase project HTTPS URL.");
  }

  const anonKey = values.get("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (anonKey && /^(public-anon-key|anon|changeme|placeholder|test)$/i.test(anonKey)) {
    errors.push("NEXT_PUBLIC_SUPABASE_ANON_KEY must not be a placeholder value for staging/beta.");
  }

  for (const key of values.keys()) {
    if (/^NEXT_PUBLIC_.*(SERVICE_ROLE|SECRET|TOKEN|PASSWORD|PRIVATE|DIRECT_URL|DATABASE_URL)/i.test(key)) {
      errors.push(`${key} must not expose server-side or sensitive configuration to the browser.`);
    }
  }

  const serviceRoleKey = values.get("SUPABASE_SERVICE_ROLE_KEY");
  if (serviceRoleKey && /^(service-role|changeme|placeholder|test)$/i.test(serviceRoleKey)) {
    errors.push("SUPABASE_SERVICE_ROLE_KEY must be empty or a real secret managed outside the repository.");
  }

  for (const key of ["FEATURE_REAL_NFSE_ENABLED", "FEATURE_SCRAPING_ENABLED", "FEATURE_MUNICIPAL_PROVIDER_ENABLED"]) {
    if (values.get(key) !== "false") {
      errors.push(`${key} must remain false for controlled beta.`);
    }
  }

  return errors;
}

function runCli() {
  const envPath = process.argv[2] ?? ".env.local";
  const absolutePath = resolve(envPath);

  if (!existsSync(absolutePath)) {
    console.error(`Environment file not found: ${envPath}`);
    process.exit(1);
  }

  const errors = validateBetaEnvContent(readFileSync(absolutePath, "utf8"));

  if (errors.length > 0) {
    console.error("Staging/beta environment validation failed:");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log("Staging/beta environment validation passed.");
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  runCli();
}
