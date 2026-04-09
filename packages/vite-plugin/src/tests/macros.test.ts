import { expect, it, describe } from "vitest";

import { Options } from "..";
import { bundle } from "./adapter";

describe("default macros", () => {
  it("will apply unit conversion", async () => {
    const css = await toCss(`
      export const Component = () => {
        fontSize: 16;

        return <div>Hello!</div>;
      };
    `);

    expect(css).toContain("font-size: 16px");
  });

  it("will expand position macro", async () => {
    const css = await toCss(`
      export const Component = () => {
        absolute: fill;

        return <div />;
      };
    `);

    expect(css).toContain("position: absolute");
  });

  it("will expand border macro", async () => {
    const css = await toCss(`
      export const Component = () => {
        border: red, 2;

        return <div />;
      };
    `);

    expect(css).toContain("border: red solid 2px");
  });

  it("will expand size macro", async () => {
    const css = await toCss(`
      export const Component = () => {
        size: 100, 50;

        return <div />;
      };
    `);

    expect(css).toContain("width: 100px");
    expect(css).toContain("height: 50px");
  });

  it("will expand flexAlign macro", async () => {
    const css = await toCss(`
      export const Component = () => {
        flexAlign: right, center;

        return <div />;
      };
    `);

    expect(css).toContain("display: flex");
    expect(css).toContain("flex-direction: row");
    expect(css).toContain("justify-content: center");
    expect(css).toContain("align-items: center");
  });

  it("will expand margin shorthand", async () => {
    const css = await toCss(`
      export const Component = () => {
        margin: 10, 20;

        return <div />;
      };
    `);

    expect(css).toContain("margin: 10px 20px");
  });

  it("will opt out of defaults with false", async () => {
    const css = await toCss(`
      export const Component = () => {
        absolute: fill;

        return <div />;
      };
    `, { macros: [false] });

    expect(css).not.toContain("position: absolute");
  });
});

async function toCss(template: string, options?: Options) {
  const files = await bundle(template, options).then(Object.entries);
  const css = files.find(([k]) => k.endsWith(".css"));

  return css ? css[1] : "";
}