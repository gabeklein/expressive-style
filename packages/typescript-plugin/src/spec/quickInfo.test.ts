import { describe, expect, it } from "vitest";

import { displayText, docText, getQuickInfoWithPlugin } from "./helpers";

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

describe("underscore attribute hover", () => {
  it("summarizes a single matching label block with its properties", () => {
    const info = getQuickInfoWithPlugin(`
      const Component = () => {
        label: {
          color: "red";
        }
        return <div _la|bel />;
      };
    `);

    expect(info).toBeDefined();
    expect(displayText(info)).toBe('label (line 3)\n  color: "red"');
  });

  it("renders nested selector path with > separator", () => {
    const info = getQuickInfoWithPlugin(`
      const Component = () => {
        content: {
          label: {
            color: "red";
          }
        }
        return <div _la|bel />;
      };
    `);

    expect(info).toBeDefined();
    expect(displayText(info)).toBe('content > label (line 4)\n  color: "red"');
  });

  it("lists multiple matching blocks separated by blank line", () => {
    const info = getQuickInfoWithPlugin(`
      const Component = () => {
        label: {
          color: "red";
        }
        $hover: {
          label: {
            color: "blue";
          }
        }
        return <div _la|bel />;
      };
    `);

    expect(info).toBeDefined();
    expect(displayText(info)).toBe(
      'label (line 3)\n  color: "red"\n\n$hover > label (line 7)\n  color: "blue"',
    );
  });

  it("includes multiple properties from a single block", () => {
    const info = getQuickInfoWithPlugin(`
      const Component = () => {
        label: {
          color: "red";
          display: "flex";
        }
        return <div _la|bel />;
      };
    `);

    expect(info).toBeDefined();
    expect(displayText(info)).toBe(
      'label (line 3)\n  color: "red"\n  display: "flex"',
    );
  });

  it("returns no custom info when underscore attribute has no matching label", () => {
    const info = getQuickInfoWithPlugin(`
      const Component = () => {
        color: "red";
        return <div _nom|atch />;
      };
    `);

    // Either undefined (default returned nothing) or non-custom format.
    const text = displayText(info);
    expect(text).not.toContain("(line ");
  });

  it("returns no custom info for non-underscore JSX attribute", () => {
    const info = getQuickInfoWithPlugin(`
      const Component = () => {
        label: {
          color: "red";
        }
        return <div co|ntent />;
      };
    `);

    // 'content' is a valid attr on div in our ambient JSX - but since it's
    // not prefixed with _, our attribute crawler should not engage.
    const text = displayText(info);
    expect(text).not.toContain("(line ");
    expect(text).not.toContain(" > ");
  });
});
