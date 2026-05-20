import { resolveProject } from "./resolve";
import { writeScaffold } from "./scaffold";

export async function runDev(cwd = process.cwd()): Promise<void> {
  const resolved = await resolveProject(cwd);
  const { servePath, bunfigPath } = writeScaffold(resolved);

  const child = Bun.spawn({
    cmd: ["bun", `--config=${bunfigPath}`, "--hot", servePath],
    cwd: resolved.cwd,
    env: process.env,
    stdio: ["inherit", "inherit", "inherit"],
  });

  const code = await child.exited;
  process.exit(code);
}
