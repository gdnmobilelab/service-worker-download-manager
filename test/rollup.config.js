const typescript = require("typescript");
const rollupTypescript = require("rollup-plugin-typescript");
const commonjs = require("rollup-plugin-commonjs");
const nodeResolve = require("rollup-plugin-node-resolve");
const builtins = require("rollup-plugin-node-builtins");

module.exports = {
  format: "iife",
  plugins: [
    nodeResolve({
      extensions: [".js", ".ts"],
      preferBuiltins: false,
      browser: true
    }),
    commonjs(),
    rollupTypescript({
      typescript: typescript
    }),
    builtins()
  ]
};
