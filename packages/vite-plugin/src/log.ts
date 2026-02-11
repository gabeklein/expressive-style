const RESET = "\x1b[0m";
const DIM = "\x1b[2m";
const MAGENTA = "\x1b[35m";

type LogFn = (
  hook: string,
  msg: string,
  extra?: Record<string, unknown>,
) => void;

const enabled = /expressive|vite-plugin-expressive/.test(
  process.env.DEBUG ?? "",
);

function emit(
  hook: string,
  color: string,
  msg: string,
  extra?: Record<string, unknown>,
) {
  if (!enabled) return;

  const now = new Date();
  const t = `${String(now.getMinutes()).padStart(2, "0")}:${String(
    now.getSeconds(),
  ).padStart(2, "0")}.${String(now.getMilliseconds()).padStart(3, "0")}`;

  const parts = [
    `${DIM}${t}${RESET}`,
    `${MAGENTA}[expressive]${RESET}`,
    `${color}${hook}${RESET}`,
    msg,
  ];

  if (extra)
    for (const [k, v] of Object.entries(extra)) {
      parts.push(`${DIM}${k}=${JSON.stringify(v)}${RESET}`);
    }

  console.log(parts.join(" "));
}

const color =
  (code: string): LogFn =>
  (hook, msg, extra) =>
    emit(hook, code, msg, extra);

export const log = {
  dim: color(DIM),
  cyan: color("\x1b[36m"),
  gold: color("\x1b[33m"),
  green: color("\x1b[32m"),
  red: color("\x1b[31m"),
  pink: color(MAGENTA),
};
