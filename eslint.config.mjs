// @ts-check
import antfu from "@antfu/eslint-config";
import betterTailwindcss from "eslint-plugin-better-tailwindcss";
import { getDefaultSelectors } from "eslint-plugin-better-tailwindcss/defaults";
import pnpm from "eslint-plugin-pnpm";

import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt(
    antfu(
        {
            type: "app",
            vue: true,
            typescript: true,
            formatters: true,
            stylistic: {
                indent: 4,
                semi: true,
                quotes: "double",
                overrides: {
                    "style/comma-dangle": ["error", "never"],
                    "style/brace-style": ["error", "1tbs"]
                }
            }
        },
        betterTailwindcss.configs["correctness-error"],
        {
            settings: {
                "better-tailwindcss": {
                    entryPoint: "app/assets/css/main.css",
                    selectors: [
                        ...getDefaultSelectors(),
                        {
                            kind: "attribute",
                            name: "^v-bind:ui$",
                            match: [{ type: "objectValues" }]
                        }
                    ]
                }
            }
        },
        {
            rules: {
                "ts/consistent-type-definitions": ["error", "type"],
                "no-console": ["warn", { allow: ["warn", "error"] }],
                "antfu/no-top-level-await": ["off"],
                "node/prefer-global/process": ["off"],
                "node/no-process-env": ["error", { allowedVariables: ["CI"] }],
                "perfectionist/sort-imports": ["error", {
                    // tsconfigRootDir: '.',
                }]
                // "unicorn/filename-case": ["error", { "case": "kebabCase", "ignore": ["README.md"] }],

            }
        },
        {
            files: ["pnpm-workspace.yaml"],
            plugins: { pnpm },
            rules: {
                "pnpm/yaml-enforce-settings": ["error", {
                    settings: {
                        minimumReleaseAgeExcludePrune: true,
                        shellEmulator: true,
                        trustPolicy: "no-downgrade",
                        overrides: {
                            "semver@^6.3.1": "^7.7.1"
                        }
                    }
                }]
            }
        }
    ),
    {
        rules: {
            "yaml/indent": ["error", 2]
        }
    }
);
