import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "coverage/**",
      "next-env.d.ts",
      ".aiox-core/**",
      ".antigravity/**",
      ".claude/**",
      ".codex/**",
      ".cursor/**",
      ".gemini/**",
      ".github/**",
      ".kimi/**",
      ".agent/**",
      "external/**"
    ]
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        React: "readonly",
        crypto: "readonly",
        process: "readonly"
      }
    },
    plugins: {
      "@typescript-eslint": tsPlugin
    },
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
      "@typescript-eslint/consistent-type-imports": "error",
      "no-restricted-imports": [
        "error",
        {
          "patterns": [
            {
              "group": ["@/shared/database/*"],
              "message": "Access database through module application services or repositories, not UI components."
            }
          ]
        }
      ]
    }
  }
];
