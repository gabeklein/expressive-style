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

describe("completions excluded outside label context", () => {
  it("does not offer completions in a function that returns no JSX", () => {
    const result = getCompletionsWithPlugin(`
      function helper() {
        |
        return 42;
      }
    `);
    expect(names(result)).not.toContain("color");
    expect(names(result)).not.toContain("$hover");
  });

  it("does not offer completions in a nested non-label block", () => {
    const result = getCompletionsWithPlugin(`
      const Component = () => {
        if (true) {
          |
        }
        return <div />;
      };
    `);
    expect(names(result)).not.toContain("color");
  });

  it("does not offer completions inside JSX", () => {
    const result = getCompletionsWithPlugin(`
      const Component = () => {
        return <div |/>;
      };
    `);
    expect(names(result)).not.toContain("color");
  });

  it("does not offer completions inside a for-loop label", () => {
    const result = getCompletionsWithPlugin(`
      const Component = () => {
        outer: for (let i = 0; i < 10; i++) {
          |
        }
        return <div />;
      };
    `);
    expect(names(result)).not.toContain("color");
  });

  it("does not offer completions in an inner function", () => {
    const result = getCompletionsWithPlugin(`
      const Component = () => {
        const helper = () => {
          |
        };
        return <div />;
      };
    `);
    expect(names(result)).not.toContain("color");
  });

  it("does not offer completions in a type assertion", () => {
    const result = getCompletionsWithPlugin(`
      const Component = () => {
        const x = {} as |
        return <div />;
      };
    `);
    expect(names(result)).not.toContain("color");
  });

  it("does not offer completions in a variable initializer", () => {
    const result = getCompletionsWithPlugin(`
      const Component = () => {
        const x = |
        return <div />;
      };
    `);
    expect(names(result)).not.toContain("color");
  });

  it("does not offer completions in an object literal argument", () => {
    const result = getCompletionsWithPlugin(`
      const Component = () => {
        foo({ | })
        return <div />;
      };
    `);
    expect(names(result)).not.toContain("color");
  });

  it("does not offer completions in a satisfies expression", () => {
    const result = getCompletionsWithPlugin(`
      const Component = () => {
        const x = {} satisfies |
        return <div />;
      };
    `);
    expect(names(result)).not.toContain("color");
  });

  it("does not offer completions in a return expression", () => {
    const result = getCompletionsWithPlugin(`
      const Component = () => {
        return |
      };
    `);
    expect(names(result)).not.toContain("color");
  });

  it("does not offer completions in a type annotation", () => {
    const result = getCompletionsWithPlugin(`
      const Component = () => {
        const x: | = 5;
        return <div />;
      };
    `);
    expect(names(result)).not.toContain("color");
  });
});
