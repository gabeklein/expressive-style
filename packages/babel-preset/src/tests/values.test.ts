import { expect, it } from "vitest";
import { parser } from "./adapter";

it("will convert camelCase properties to dash", async () => {
  const output = await parser(`
    const Component = () => {
      boxSizing: border-box;

      return <div />
    }
  `);

  expect(output.css).toMatchInlineSnapshot(`
    .Component_14k {
      box-sizing: border-box;
    }
  `);
});

it("will convert numbers to px", async () => {
  const output = await parser(`
    const Component = () => {
      fontSize: 12;

      return <div />
    }
  `);

  expect(output.css).toMatchInlineSnapshot(`
    .Component_25s {
      font-size: 12;
    }
  `);
});

it("will convert decimal to em", async () => {
  const output = await parser(`
    const Component = () => {
      fontSize: 1.5;

      return <div />
    }
  `);

  expect(output.css).toMatchInlineSnapshot(`
    .Component_2hp {
      font-size: 1.5;
    }
  `);
});

it("will convert $-prefixed properties to css variables", async () => {
  const output = await parser(`
    const Component = () => {
      $colorPrimary: blue;

      inner: {
        color: $colorPrimary;
      }

      return (
        <div>
          <inner>
            Hello
          </inner>
        </div>
      )
    }
  `);

  expect(output.css).toMatchInlineSnapshot(`
    .Component_27z {
      --color-primary: blue;
    }
    .inner_tla {
      color: var(--color-primary);
    }
  `);
});
