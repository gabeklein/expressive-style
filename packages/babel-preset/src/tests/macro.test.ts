import { expect, it } from "vitest";
import { parser } from "./adapter";

it("will bail on repeat macro", async () => {
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
    .Component_238 {
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

it("will apply complex style", async () => {
  const output = await parser(`
    const Component = () => {
      transform: translateX(10), rotate(90), scale(2);

      return <div />
    }
  `);

  expect(output.code).toMatchInlineSnapshot(`
    const _concat = (...args) => args.filter(Boolean).join(' ');
    const Component = (props) => {
      return (
        <div className={_concat(props.className, 'Component_2du')} />
      );
    };
  `);

  expect(output.css).toMatchInlineSnapshot(`
    .Component_2du {
      transform: translateX(10) rotate(90) scale(2);
    }
  `);
});

it("will apply absolute", async () => {
  const output = await parser(`
    const Component = () => {
      absolute: fill-bottom;

      return <div />
    }
  `);

  expect(output.css).toMatchInlineSnapshot(`
    .Component_2a4 {
      bottom: 0;
      right: 0;
      left: 0;
      position: absolute;
    }
  `);
});

it("will apply outline macro", async () => {
  const output = await parser(`
    const Component = () => {
      outline: red;

      return <div />
    }
  `);

  expect(output.css).toMatchInlineSnapshot(`
    .Component_13o {
      outline: 1px dashed red;
    }
  `);
});
