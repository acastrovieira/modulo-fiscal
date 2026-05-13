export type AppEnvironment = "Local" | "Staging" | "Homologação" | "Produção";

export function getAppEnvironment(): AppEnvironment {
  const value = process.env.NEXT_PUBLIC_APP_ENV;

  if (value === "Staging" || value === "Homologação" || value === "Produção") {
    return value;
  }

  return "Local";
}
