import { expect, it } from "vitest";
import { parser } from "./adapter";

it("will apply custom macro", async () => {
  function foo(value: any) {
    return {
      foo: value + "Baz",
    };
  }

  const parse = parser({
    macros: [{ foo }],
  });

  const output = await parse(`
    const Component = () => {
      foo: "bar";

      return <div />
    }
  `);

  expect(output.css).toMatchInlineSnapshot(`
    .Component_2do {
      foo: barBaz;
    }
  `);
});

it("will convert native hex color", async () => {
  const output = await parser(`
    const Component = () => {
      color: 0xff0000;
      background: 0x00ff0022;

      return <div />
    }
  `);

  expect(output.css).toMatchInlineSnapshot(`
    .Component_23b {
      color: #ff0000;
      background: rgba(0, 255, 0, 0.133);
    }
  `);
});

it("will bypass macro for template literal", async () => {
  function foo() {
    throw new Error("macro should not be called");
  }

  const parse = parser({
    macros: [{ foo }],
  });

  const output = await parse(`
    const Component = () => {
      foo: \`bar baz\`;

      return <div />
    }
  `);

  expect(output.css).toMatchInlineSnapshot(`
    .Component_2iw {
      foo: bar baz;
    }
  `);
});
