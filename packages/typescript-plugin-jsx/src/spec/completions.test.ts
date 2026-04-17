import { describe, expect, it } from "vitest";

import { getCompletionsWithPlugin } from "./helpers";

function names(result: ReturnType<typeof getCompletionsWithPlugin>) {
  return result?.entries.map(e => e.name) ?? [];
}

describe("completions inside label block", () => {
  it("offers completions inside a label block", () => {
    const result = getCompletionsWithPlugin(`
      const Component = () => {
        foo: {
          |
        }
        return <div />;
      };
    `);

    // CSS properties
    expect(names(result)).toContain("color");
    expect(names(result)).toContain("display");

    // Instructions
    expect(names(result)).toContain("$hover");
  });

  it("offers instruction completions inside a label block", () => {
    const result = getCompletionsWithPlugin(`
      const Component = () => {
        foo: {
          |
        }
        return <div />;
      };
    `);
    expect(names(result)).toContain("$hover");
  });

  it("offers completions as direct label body (no braces)", () => {
    const result = getCompletionsWithPlugin(`
      const Component = () => {
        foo: |
        return <div />;
      };
    `);
    expect(names(result)).toContain("color");
  });

  it("offers completions in top-level component body", () => {
    const result = getCompletionsWithPlugin(`
      const Component = () => {
        |
        return <div />;
      };
    `);
    expect(names(result)).toContain("color");
  });
});