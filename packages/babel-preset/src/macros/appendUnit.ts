export function appendUnit(val: number | string, unit?: string) {
  if (val === 0) return "0";

  if (val === undefined) return "";

  if (typeof val != "number") return val;

  if (!unit)
    if (/\d+.\d+/.test(String(val))) unit = "em";
    else unit = "px";

  return val + unit;
}
