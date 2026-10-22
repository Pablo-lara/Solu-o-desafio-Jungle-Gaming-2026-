"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("vitest/config");
exports.default = (0, config_1.defineConfig)({
    // Resolves the path aliases declared in tsconfig.json, including the ones
    // added by `nest g library`. Requires Vite 8, which ships this option.
    resolve: { tsconfigPaths: true },
    test: {
        globals: true,
        root: './',
        include: ['**/*.spec.ts'],
    },
});
