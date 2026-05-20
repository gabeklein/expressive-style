import { writeFileSync } from "node:fs";
import { join } from "node:path";

import { loadConfig, resolveProject } from "./resolve";
import { writeScaffold } from "./scaffold";

export async function runDev(cwd = process.cwd()): Promise<void> {
  const resolved = await resolveProject(cwd);
  const config = await loadConfig(resolved.configPath);
  const port = (config as any).port ?? 3000;
  const { dir, servePath } = writeScaffold(resolved, port);

  // Style plugin is registered via a generated bunfig.toml inside .expressive/.
  // BUN_CONFIG_PATH points Bun at it so the user doesn't need their own.
  const bunfig = join(dir, "bunfig.toml");
  writeFileSync(
    bunfig,
    `[serve.static]\nplugins = ["@expressive/bun-style-plugin"]\n`,
  );

  const proc = Bun.spawn({
    cmd: ["bun", "--hot", servePath],
    cwd: resolved.cwd,
    env: { ...process.env, BUN_CONFIG_PATH: bunfig },
    stdio: ["inherit", "inherit", "inherit"],
  });

  const code = await proc.exited;
  process.exit(code);
}
