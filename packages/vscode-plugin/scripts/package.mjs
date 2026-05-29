#!/usr/bin/env node
import { execSync } from "node:child_process";
import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const stage = resolve(root, ".vsce-stage");
const pluginName = "@expressive@expressive/typescript-plugin-style";
const pluginRoot = resolve(root, "..", "typescript-plugin-jsx");
const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));

rmSync(stage, { recursive: true, force: true });
mkdirSync(stage, { recursive: true });

for (const f of ["icon.png", "icon.svg", "README.md", ".vscodeignore"])
  cpSync(resolve(root, f), resolve(stage, f));

execSync(`npm pack --pack-destination ${stage} --loglevel=error`, {
  cwd: pluginRoot,
  stdio: "inherit",
});
const tarball = readdirSync(stage).find(f => f.endsWith(".tgz"));

writeFileSync(
  resolve(stage, "package.json"),
  JSON.stringify({ ...pkg, dependencies: { [pluginName]: `file:./${tarball}` } }, null, 2)
);

execSync(`npm install --omit=dev --no-package-lock --no-audit --no-fund --loglevel=error`, {
  cwd: stage,
  stdio: "inherit",
});

execSync(`npx vsce package --allow-missing-repository --out ${root}`, {
  cwd: stage,
  stdio: "inherit",
});

rmSync(stage, { recursive: true, force: true });
