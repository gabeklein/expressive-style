import type { Instruction } from "./jsxPlugin/context";

const PSEUDO_SELECTORS = [
  "hover",
  "focus",
  "active",
  "visited",
  "disabled",
  "checked",
  "firstChild",
  "lastChild",
  "firstOfType",
  "lastOfType",
  "onlyChild",
  "onlyOfType",
  "empty",
  "link",
  "anyLink",
  "focusVisible",
  "focusWithin",
  "placeholderShown",
  "default",
  "enabled",
  "readOnly",
  "readWrite",
  "required",
  "optional",
  "valid",
  "invalid",
  "inRange",
  "outOfRange",
  "before",
  "after",
  "firstLine",
  "firstLetter",
  "selection",
  "placeholder",
];

const PSEUDO_ELEMENTS = new Set([
  "before",
  "after",
  "firstLine",
  "firstLetter",
  "selection",
  "placeholder",
]);

function toKebab(name: string) {
  return name.replace(/[A-Z]/g, m => "-" + m.toLowerCase());
}

export const DefaultInstructions: Record<string, Instruction> = {};

for (const name of PSEUDO_SELECTORS) {
  const separator = PSEUDO_ELEMENTS.has(name) ? "::" : ":";
  const css = toKebab(name);

  DefaultInstructions[name] = function () {
    this.condition = separator + css;
  };
}
