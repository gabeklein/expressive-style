import { describe, expect, it } from "vitest";

import {
  displayText,
  docText,
  getQuickInfoWithPlugin,
} from "./helpers";

describe("label name hover", () => {
  it("resolves property label to Expressive.Properties entry", () => {
    const info = getQuickInfoWithPlugin(`
      const Component = () => {
        col|or: "red";
      };
    `);

    expect(info).toBeDefined();
    expect(info!.kind).toBe("property");
    expect(displayText(info)).toBe("color: (value: string | number) => void");
    expect(docText(info)).toBe("Sets the text color");
  });

  it("resolves instruction label ($hover) to Expressive.Instructions entry", () => {
    const info = getQuickInfoWithPlugin(`
      const Component = () => {
        $ho|ver: {
          color: "blue";
        }
      };
    `);

    expect(info).toBeDefined();
    expect(info!.kind).toBe("property");
    expect(displayText(info)).toBe("$hover: () => void");
    expect(docText(info)).toBe("Applies styles on hover");
  });

  it("falls back to string literal for unknown label names", () => {
    const info = getQuickInfoWithPlugin(`
      const Component = () => {
        mys|teryLabel: "value";
      };
    `);

    expect(info).toBeDefined();
    expect(info!.kind).toBe("const");
    expect(displayText(info)).toBe('"mysteryLabel"');
  });
});

describe("label value hover", () => {
  it("renders identifier values as string literals", () => {
    const info = getQuickInfoWithPlugin(`
      const Component = () => {
        color: re|d;
      };
    `);

    expect(info).toBeDefined();
    expect(info!.kind).toBe("const");
    expect(displayText(info)).toBe('"red"');
  });
});

describe("non-label hover", () => {
  it("passes through to default TS hover", () => {
    const info = getQuickInfoWithPlugin(`
      const fo|o = 42;
    `);

    // Default TS hover should return something, and it should not
    // be our custom const/property kinds with a stringLiteral display.
    expect(info).toBeDefined();
    // The default hover for 'foo' would say: const foo: 42
    expect(displayText(info)).toContain("foo");
  });
});
