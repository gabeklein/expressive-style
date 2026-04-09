export function appendUnit(val: number | string, unit?: string): string {
  if (!Number(val)) return String(val || 0);

  if (!unit)
    if (/\d+\.\d+/.test(String(val))) unit = "em";
    else unit = "px";

  return val + unit;
}
