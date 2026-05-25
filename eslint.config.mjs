import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // Prototype codebase — patterns inherited from Osiris that are non-trivial to refactor
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      // Original Osiris code uses Date.now() and setState in effects throughout
      "react-compiler/react-compiler": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/exhaustive-deps": "warn",
      // Osiris uses useRef(Date.now()) and dataRef.current in render — non-trivial to refactor
      "react-hooks/purity": "off",
      "react-hooks/refs": "off",
    },
  },
]);

export default eslintConfig;
