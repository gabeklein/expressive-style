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

it("will apply $md breakpoint", async () => {
  const output = await parser(`
    const Component = () => {
      fontSize: 14;

      $md: {
        fontSize: 18;
      }

      return <div />
    }
  `);

  expect(output.css).toMatchInlineSnapshot(`
    .Component_2dp {
      font-size: 14px;
    }
    @media (min-width: 768px) {
    .Component_2dp {
      font-size: 18px;
    }
    }
  `);
});

it("will combine breakpoint with pseudo", async () => {
  const output = await parser(`
    const Component = () => {
      color: red;

      $md: {
        color: blue;

        $hover: {
          color: green;
        }
      }

      return <div />
    }
  `);

  expect(output.css).toMatchInlineSnapshot(`
    .Component_169 {
      color: red;
    }
    @media (min-width: 768px) {
    .Component_169 {
      color: blue;
    }
    .Component_169:hover {
      color: green;
    }
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
