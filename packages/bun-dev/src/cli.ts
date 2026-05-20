#!/usr/bin/env bun
const HELP = `expressive - Expressive Dev for Bun

Usage:
  expressive             Run dev server (alias for 'dev')
  expressive dev         Run dev server with HMR
  expressive build       Bundle to ./dist
  expressive --help

Project layout:
  app.tsx | src/app.tsx  Root React component (default export)
  index.ts               Optional. Server config (export default satisfies AppConfig)
  index.html             Optional. Custom HTML shell
`;

async function main() {
  const [cmd] = process.argv.slice(2);

  if (cmd === "-h" || cmd === "--help") {
    console.log(HELP);
    return;
  }

  try {
    switch (cmd) {
      case undefined:
      case "dev": {
        const mod = await import("./dev");
        await mod.runDev();
        return;
      }
      case "build": {
        const mod = await import("./build");
        await mod.runBuild();
        return;
      }
      default:
        console.error(`Unknown command: ${cmd}\n\n${HELP}`);
        process.exit(1);
    }
  } catch (err: any) {
    console.error(err?.message ?? err);
    process.exit(1);
  }
}

main();
