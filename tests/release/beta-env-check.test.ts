import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const validBetaEnv = [
  'DATABASE_URL="postgresql://user:password@staging-db.example.com:5432/vetfiscal"',
  'DIRECT_URL="postgresql://user:password@staging-db.example.com:5432/vetfiscal"',
  'NEXT_PUBLIC_APP_ENV="Staging"',
  'NEXT_PUBLIC_APP_URL="https://vetfiscal-staging.example.com"',
  'NEXT_PUBLIC_SUPABASE_URL="https://vetfiscal-staging.supabase.co"',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo-anon-key.signature"',
  'SUPABASE_SERVICE_ROLE_KEY=""',
  'SENTRY_DSN=""',
  'FEATURE_REAL_NFSE_ENABLED="false"',
  'FEATURE_SCRAPING_ENABLED="false"',
  'FEATURE_MUNICIPAL_PROVIDER_ENABLED="false"'
].join("\n");

describe("staging/beta environment validation", () => {
  it("accepts a staging-like env file without enabling fiscal integrations", () => {
    const directory = mkdtempSync(join(tmpdir(), "vetfiscal-beta-env-"));
    const envPath = join(directory, ".env.local");
    writeFileSync(envPath, validBetaEnv);

    const output = execFileSync("node", ["scripts/check-beta-env.mjs", envPath], { encoding: "utf8" });

    expect(output).toContain("Staging/beta environment validation passed.");
  });

  it("rejects local envs and enabled fiscal safety flags", () => {
    const directory = mkdtempSync(join(tmpdir(), "vetfiscal-beta-env-"));
    const envPath = join(directory, ".env.local");
    writeFileSync(envPath, [
      'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/vetfiscal"',
      'NEXT_PUBLIC_APP_ENV="Local"',
      'NEXT_PUBLIC_APP_URL="http://localhost:3000"',
      'NEXT_PUBLIC_SUPABASE_URL=""',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY=""',
      'FEATURE_REAL_NFSE_ENABLED="true"',
      'FEATURE_SCRAPING_ENABLED="false"',
      'FEATURE_MUNICIPAL_PROVIDER_ENABLED="true"'
    ].join("\n"));

    expect(() => execFileSync("node", ["scripts/check-beta-env.mjs", envPath], { encoding: "utf8", stdio: "pipe" })).toThrow(/Staging\/beta environment validation failed/);
  });

  it("rejects unsafe Supabase staging configuration", () => {
    const directory = mkdtempSync(join(tmpdir(), "vetfiscal-beta-env-"));
    const envPath = join(directory, ".env.local");
    writeFileSync(envPath, [
      'DATABASE_URL="postgresql://user:password@staging-db.example.com:5432/vetfiscal"',
      'DIRECT_URL="postgresql://postgres:postgres@localhost:5432/vetfiscal"',
      'NEXT_PUBLIC_APP_ENV="Staging"',
      'NEXT_PUBLIC_APP_URL="https://vetfiscal-staging.example.com"',
      'NEXT_PUBLIC_SUPABASE_URL="http://localhost:54321"',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY="placeholder"',
      'NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY="service-role"',
      'FEATURE_REAL_NFSE_ENABLED="false"',
      'FEATURE_SCRAPING_ENABLED="false"',
      'FEATURE_MUNICIPAL_PROVIDER_ENABLED="false"'
    ].join("\n"));

    expect(() => execFileSync("node", ["scripts/check-beta-env.mjs", envPath], { encoding: "utf8", stdio: "pipe" })).toThrow(/Staging\/beta environment validation failed/);
  });

  it("runs as a CLI without printing environment values", () => {
    const directory = mkdtempSync(join(tmpdir(), "vetfiscal-beta-env-"));
    const envPath = join(directory, ".env.local");
    writeFileSync(envPath, validBetaEnv);

    const output = execFileSync("node", ["scripts/check-beta-env.mjs", envPath], { encoding: "utf8" });

    expect(output).toContain("Staging/beta environment validation passed.");
    expect(output).not.toContain("postgresql://");
    expect(output).not.toContain("demo-anon-key");
  });
});
