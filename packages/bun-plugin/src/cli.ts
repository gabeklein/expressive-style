#!/usr/bin/env bun
import { expressiveJSX } from "./index";

type BuildConfig = Parameters<typeof Bun.build>[0];

const HELP = `expressive-bun-plugin - bundle with Expressive JSX baked in

Usage: expressive-bun <entrypoints...> [options]

Options mirror \`bun build\`. Supported flags:
  -o, --outdir <dir>
      --outfile <file>
      --target <browser|bun|node>
      --format <esm|cjs|iife>
      --root <dir>
      --public-path <path>
      --splitting
      --minify
      --minify-whitespace
      --minify-syntax
      --minify-identifiers
      --sourcemap[=<none|linked|inline|external>]
      --external <pkg>            (repeatable)
      --packages <bundle|external>
      --define <KEY=VALUE>        (repeatable)
      --loader <.ext:loader>      (repeatable)
      --conditions <name>         (repeatable)
      --drop <name>               (repeatable)
      --banner <text>
      --footer <text>
      --entry-naming <pattern>
      --chunk-naming <pattern>
      --asset-naming <pattern>
      --bytecode
      --compile
      --production
      --env <inline|disable|PREFIX_*>
      --no-bundle
  -h, --help
`;

function die(msg: string): never {
  console.error(msg);
  process.exit(1);
}

function next(argv: string[], i: number, flag: string) {
  const v = argv[i + 1];
  if (v === undefined || v.startsWith("-")) die(`Missing value for ${flag}`);
  return v;
}

function parse(argv: string[]): BuildConfig {
  const config: any = {
    entrypoints: [],
    outdir: "./dist",
    target: "browser",
    minify: true,
    sourcemap: "linked",
    production: true,
  };
  const external: string[] = [];
  const conditions: string[] = [];
  const drop: string[] = [];
  const define: Record<string, string> = {};
  const loader: Record<string, string> = {};

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === "-h" || arg === "--help") {
      console.log(HELP);
      process.exit(0);
    }

    if (!arg.startsWith("-")) {
      config.entrypoints.push(arg);
      continue;
    }

    const [flag, inline] = arg.includes("=") ? arg.split(/=(.*)/s) : [arg, undefined];
    const take = () => inline ?? next(argv, i++, flag);

    switch (flag) {
      case "-o":
      case "--outdir": config.outdir = take(); break;
      case "--outfile": config.outfile = take(); break;
      case "--target": config.target = take() as BuildConfig["target"]; break;
      case "--format": config.format = take() as BuildConfig["format"]; break;
      case "--root": config.root = take(); break;
      case "--public-path": config.publicPath = take(); break;
      case "--splitting": config.splitting = true; break;
      case "--minify": config.minify = true; break;
      case "--minify-whitespace":
        config.minify = typeof config.minify === "object" ? config.minify : {};
        config.minify.whitespace = true; break;
      case "--minify-syntax":
        config.minify = typeof config.minify === "object" ? config.minify : {};
        config.minify.syntax = true; break;
      case "--minify-identifiers":
        config.minify = typeof config.minify === "object" ? config.minify : {};
        config.minify.identifiers = true; break;
      case "--sourcemap":
        config.sourcemap = (inline ?? "linked") as BuildConfig["sourcemap"]; break;
      case "--external": external.push(take()); break;
      case "--packages": config.packages = take() as BuildConfig["packages"]; break;
      case "--define": {
        const [k, ...rest] = take().split("=");
        define[k] = rest.join("=");
        break;
      }
      case "--loader": {
        const [ext, kind] = take().split(":");
        loader[ext] = kind;
        break;
      }
      case "--conditions": conditions.push(take()); break;
      case "--drop": drop.push(take()); break;
      case "--banner": config.banner = take(); break;
      case "--footer": config.footer = take(); break;
      case "--entry-naming":
        config.naming = typeof config.naming === "object" ? config.naming : {};
        config.naming.entry = take(); break;
      case "--chunk-naming":
        config.naming = typeof config.naming === "object" ? config.naming : {};
        config.naming.chunk = take(); break;
      case "--asset-naming":
        config.naming = typeof config.naming === "object" ? config.naming : {};
        config.naming.asset = take(); break;
      case "--bytecode": config.bytecode = true; break;
      case "--compile": config.compile = true; break;
      case "--production": config.production = true; break;
      case "--env": config.env = take(); break;
      case "--no-bundle": config.bundle = false; break;
      case "--no-minify": config.minify = false; break;
      case "--no-sourcemap": config.sourcemap = "none"; break;
      case "--no-production":
      case "--dev": config.production = false; break;
      default: die(`Unknown flag: ${arg}\n\n${HELP}`);
    }
  }

  if (external.length) config.external = external;
  if (conditions.length) config.conditions = conditions;
  if (drop.length) config.drop = drop;
  if (Object.keys(define).length) config.define = define;
  if (Object.keys(loader).length) config.loader = loader;

  if (!config.entrypoints.length) die("No entrypoints provided.\n\n" + HELP);

  return config;
}

async function main() {
  const config = parse(process.argv.slice(2));
  const plugins = [expressiveJSX(), ...((config as any).plugins ?? [])];

  const result = await Bun.build({ ...config, plugins });

  for (const log of result.logs) console.error(log);

  if (!result.success) process.exit(1);

  for (const output of result.outputs) console.log(output.path);
}

main();
