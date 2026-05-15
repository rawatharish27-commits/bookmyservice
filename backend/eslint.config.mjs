import js from "@eslint/js";
import tseslint from "typescript-eslint";

const eslintConfig = [
  { ignores: ["node_modules/**", "dist/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"] ,
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/prefer-as-const": "off",
      "@typescript-eslint/no-unused-disable-directive": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-redundant-type-constituents": "off",
      "@typescript-eslint/no-require-imports": "off",
      "prefer-const": "off",
      "no-unused-vars": "off",
      "no-console": "off",
      "no-debugger": "off",
      "no-empty": "off",
      "no-irregular-whitespace": "off",
      "no-case-declarations": "off",
      "no-fallthrough": "off",
      "no-mixed-spaces-and-tabs": "off",
      "no-redeclare": "off",
      "no-undef": "off",
      "no-unreachable": "off",
      "no-useless-escape": "off",
    },
  },
];

export default eslintConfig;
