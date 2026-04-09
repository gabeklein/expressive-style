import { expect, it } from "vitest";
import { parser } from "./adapter";

it("will apply style to element with attribute", async () => {
  const output = await parser(`
    const Component = () => {
      hello: {
        color: red;
        fontSize: 2.0;
        padding: 128, 24;
      }

      return <div _hello />
    }
  `);

  expect(output.css).toMatchInlineSnapshot(`
    .hello_tla {
      color: red;
      font-size: 2.0;
      padding: 128 24;
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

it("will throw if label reuses the component name", async () => {
  await expect(async () => {
    await parser(`
      const Component = () => {
        Component: {
          color: red;
        }

        return <div />
      }
    `);
  }).rejects.toThrow(/conflicts with the component name/);
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

it("will apply macros passed via options", async () => {
  function absolute() {
    return { position: "absolute", top: 0, left: 0 };
  }

  const parse = parser({
    macros: [{ absolute }],
  });

  const output = await parse(`
    const Component = () => {
      absolute: fill;

      return <div />
    }
  `);

  expect(output.css).toMatchInlineSnapshot(`
    .Component_290 {
      left: 0;
      top: 0;
      position: absolute;
    }
  `);
});

it("will passthrough unknown labels as CSS", async () => {
  const output = await parser(`
    const Component = () => {
      absolute: fill;

      return <div />
    }
  `);

  expect(output.css).toMatchInlineSnapshot(`
    .Component_15j {
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
