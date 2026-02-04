import { expect, it } from "vitest";
import { parser } from "./adapter";

it("will pass", async () => {
  const output = await parser(`
    const Component = () => {
      hello: {
        color: red;
      }

      return <div _hello />
    }
  `);

  expect(output.css).toMatchInlineSnapshot(`
    .hello_tla {
      color: red;
    }
  `);

  expect(output.code).toMatchInlineSnapshot(`
    const Component = (props) => {
      return (
        <div className={_concat(props.className, 'hello_tla')} />
      );
    };
  `);
});

// deprecated test - jsx implicit return is no longer supported
it("should throw error for implicit JSX return", async () => {
  await expect(async () => {
    await parser(`
      const Component = () => {
        <hello />
      }
    `);
  }).rejects.toThrow();
});

it("will drop default macros", async () => {
  const sanityCheck = await parser(`
    const Component = () => {
      absolute: fill;

      return <div />
    }
  `);

  expect(sanityCheck.css).toMatchInlineSnapshot(`
    .Component_14i {
      bottom: 0;
      right: 0;
      left: 0;
      top: 0;
      position: absolute;
    }
  `);

  const parse = parser({
    macros: [false],
  });

  const output = await parse(`
    const Component = () => {
      absolute: fill;

      return <div />
    }
  `);

  expect(output.css).toMatchInlineSnapshot(`
    .Component_14i {
      absolute: fill;
    }
  `);
});

it("convert camelCase css values to dash-case", async () => {
  const output = await parser(`
    const Component = () => {
      hello: {
        boxSizing: border-box;
      }

      return <hello />
    }
  `);

  expect(output.css).toMatchInlineSnapshot(`
    .hello_tla {
      box-sizing: border-box;
    }
  `);
});
