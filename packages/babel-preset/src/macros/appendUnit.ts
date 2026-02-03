export function appendUnit(val: number | string, unit?: string) {
  if (val === 0) return "0";

  if (val === undefined) return "";

  if (typeof val == "number")
    return val + (unit || Number.isInteger(val) ? "px" : "em")

  return val;
}
