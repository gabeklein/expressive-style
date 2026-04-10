import { describe, expect, it } from "vitest";

import { getDiagnosticsWithPlugin } from "./helpers";

it("reports real type errors", () => {
  const code = 'const x: number = "foo";';
  const issues = getDiagnosticsWithPlugin(code, "file.ts");
  expect(issues.some((d) => d.code === 2322)).toBe(true); // Type 'string' is not assignable to type 'number'.
});

describe("style property value", () => {
  it("suppresses undefined identifiers used as label values", () => {
    const code = `
      const Component = () => {
        color: red;
      }
    `;
    expect(getDiagnosticsWithPlugin(code)).toHaveLength(0);
  });

  it("still reports undefined identifiers outside labels", () => {
    const code = `
      const Component = () => {
        const x = red;
      }
    `;
    const issues = getDiagnosticsWithPlugin(code);
    expect(issues.some((d) => d.code === 2304)).toBe(true);
  });
});

describe("style condition", () => {
  it("suppresses for single label child", () => {
    const code = `
      const Component = () => {
        if(".active")
          color: red;
      }
    `;
    expect(getDiagnosticsWithPlugin(code)).toHaveLength(0);
  });

  it("suppresses for block of label children", () => {
    const code = `
      const Component = () => {
        if(".active"){
          color: red;
          color: blue;
        }
      }
    `;
    expect(getDiagnosticsWithPlugin(code)).toHaveLength(0);
  });

  it("still reports string-literal if without a label body", () => {
    const code = `
      const Component = () => {
        if(".active") {
          const x = 1;
        }
      }
    `;
    const issues = getDiagnosticsWithPlugin(code);
    expect(issues.some((d) => d.code === 2872)).toBe(true);
  });
});

describe("underscore jsx attribute", () => {
  it("suppresses type error for _content on div", () => {
    const code = `
      const Component = () => (
        <div _content>hello</div>
      );
    `;
    const issues = getDiagnosticsWithPlugin(code);
    expect(issues).toHaveLength(0);
  });

  it("suppresses type error for arbitrary underscore attribute", () => {
    const code = `
      const Component = () => (
        <div _foo _bar>hello</div>
      );
    `;
    const issues = getDiagnosticsWithPlugin(code);
    expect(issues).toHaveLength(0);
  });

  it("suppresses underscore attribute on self-closing element", () => {
    const code = `
      const Component = () => (
        <input _label />
      );
    `;
    const issues = getDiagnosticsWithPlugin(code);
    expect(issues).toHaveLength(0);
  });

  it("suppresses underscore attribute nested in a fragment", () => {
    const code = `
      const Component = () => (
        <>
          <div _label>a</div>
          <span _hover>b</span>
        </>
      );
    `;
    const issues = getDiagnosticsWithPlugin(code);
    expect(issues).toHaveLength(0);
  });

  it("still reports non-underscore JSX attribute type errors", () => {
    const code = `
      const Component = () => (
        <div notARealProp>hello</div>
      );
    `;
    const issues = getDiagnosticsWithPlugin(code);
    expect(issues.some((d) => d.code === 2322)).toBe(true);
  });

  it("does not suppress underscore properties outside JSX", () => {
    const code = `
      interface Shape { content?: string }
      const x: Shape = { _foo: true };
    `;
    const issues = getDiagnosticsWithPlugin(code);
    // _foo on a plain object assignment should still error (not in JSX)
    expect(issues.some((d) => d.code === 2322 || d.code === 2353)).toBe(true);
  });
});
