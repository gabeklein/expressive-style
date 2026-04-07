import { expect, it } from "vitest";
import { parser } from "./adapter";

it("will apply $hover instruction", async () => {
  const output = await parser(`
    const Component = () => {
      $hover: {
        color: red;
      }

      return <div />
    }
  `);

  expect(output.css).toMatchInlineSnapshot(`
    .Component_181:hover {
      color: red;
    }
  `);
});

it("will apply $focus instruction", async () => {
  const output = await parser(`
    const Component = () => {
      color: red;

      $focus: {
        color: blue;
      }

      return <div />
    }
  `);

  expect(output.css).toMatchInlineSnapshot(`
    .Component_2d8 {
      color: red;
    }
    .Component_2d8:focus {
      color: blue;
    }
  `);
});

it("will apply $before as pseudo-element", async () => {
  const output = await parser(`
    const Component = () => {
      $before: {
        content: "hello";
      }

      return <div />
    }
  `);

  expect(output.css).toMatchInlineSnapshot(`
    .Component_14k::before {
      content: hello;
    }
  `);
});

it("will error on unknown instruction", async () => {
  await expect(parser(`
    const Component = () => {
      $unknown: {
        color: red;
      }

      return <div />
    }
  `)).rejects.toThrow('Unknown instruction "unknown"');
});
