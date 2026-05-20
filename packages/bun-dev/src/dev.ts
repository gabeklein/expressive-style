import { writeScaffold } from "./scaffold";

export async function runDev(cwd = process.cwd()): Promise<void> {
  const { servePath, bunfigPath } = writeScaffold(cwd);

  const child = Bun.spawn({
    cmd: ["bun", `--config=${bunfigPath}`, "--hot", servePath],
    cwd,
    env: process.env,
    stdio: ["inherit", "inherit", "inherit"],
  });

  const code = await child.exited;
  process.exit(code);
}
