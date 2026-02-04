import { appendUnit } from "./appendUnit";

interface NamedValue {
  named: string;
  inner: [number | string];
}

export function nToNUnits(value: number | string | NamedValue, unit?: string): string[] {
  if (value == "fill") value = "100%";

  if (typeof value === "object" && (value as NamedValue).named) {
    unit = (value as NamedValue).named;
    value = (value as NamedValue).inner[0];
  }

  return [appendUnit(value as number | string, unit)];
}

export const gap = nToNUnits;

export const top = nToNUnits;

export const left = nToNUnits;

export const right = nToNUnits;

export const bottom = nToNUnits;

export const width = nToNUnits;

export const height = nToNUnits;

export const maxWidth = nToNUnits;

export const maxHeight = nToNUnits;

export const minWidth = nToNUnits;

export const minHeight = nToNUnits;

export const fontSize = nToNUnits;

export const lineHeight = nToNUnits;

export const outlineWidth = nToNUnits;

export const borderRadius = nToNUnits;

export const backgroundSize = nToNUnits;
