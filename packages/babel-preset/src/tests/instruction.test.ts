import { describe, expect, it } from "vitest";
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
      font-size: 14;
    }
    @media (min-width: 768px) {
      .Component_2dp {
        font-size: 18;
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

it("will apply $children selector", async () => {
  const output = await parser(`
    const Component = () => {
      $children: {
        color: red;
      }

      return <div />
    }
  `);

  expect(output.css).toMatchInlineSnapshot(`
    .Component_2em > * {
      color: red;
    }
  `);
});

it("will apply $even and $odd", async () => {
  const output = await parser(`
    const Component = () => {
      $even: {
        backgroundColor: gray;
      }

      $odd: {
        backgroundColor: white;
      }

      return <div />
    }
  `);

  expect(output.css).toMatchInlineSnapshot(`
    .Component_23e:nth-child(even) {
      background-color: gray;
    }
    .Component_23e:nth-child(odd) {
      background-color: white;
    }
  `);
});

it("will apply $dark media query", async () => {
  const output = await parser(`
    const Component = () => {
      color: black;

      $dark: {
        color: white;
      }

      return <div />
    }
  `);

  expect(output.css).toMatchInlineSnapshot(`
    .Component_2eq {
      color: black;
    }
    @media (prefers-color-scheme: dark) {
      .Component_2eq {
        color: white;
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

describe("advanced", () => {
  it("will nest multiple breakpoints separately", async () => {
    const output = await parser(`
      const Component = () => {
        fontSize: 14;

        $sm: {
          fontSize: 16;
        }

        $md: {
          fontSize: 18;
        }

        $lg: {
          fontSize: 22;
        }

        return <div />
      }
    `);

    expect(output.css).toMatchInlineSnapshot(`
      .Component_14m {
        font-size: 14;
      }
      @media (min-width: 640px) {
        .Component_14m {
          font-size: 16;
        }
      }
      @media (min-width: 768px) {
        .Component_14m {
          font-size: 18;
        }
      }
      @media (min-width: 1024px) {
        .Component_14m {
          font-size: 22;
        }
      }
    `);
  });

  it("will combine breakpoint with named scope", async () => {
    const output = await parser(`
      const Component = () => {
        title: {
          fontSize: 24;

          $md: {
            fontSize: 36;
          }
        }

        return <div title />
      }
    `);

    expect(output.css).toMatchInlineSnapshot(`
      .title_tla {
        font-size: 24;
      }
      @media (min-width: 768px) {
        .title_tla {
          font-size: 36;
        }
      }
    `);
  });

  it("will stack pseudo inside pseudo", async () => {
    const output = await parser(`
      const Component = () => {
        color: red;

        $hover: {
          color: blue;

          $after: {
            content: "!";
            color: green;
          }
        }

        return <div />
      }
    `);

    expect(output.css).toMatchInlineSnapshot(`
      .Component_14m {
        color: red;
      }
      .Component_14m:hover {
        color: blue;
      }
      .Component_14m:hover::after {
        content: !;
        color: green;
      }
    `);
  });

  it("will combine conditional with breakpoint", async () => {
    const output = await parser(`
      const Component = ({ active }) => {
        color: gray;

        if(active) {
          color: blue;

          $md: {
            color: navy;
          }
        }

        return <div />
      }
    `);

    expect(output.code).toMatchInlineSnapshot(`
      const Component = ({ className, active }) => {
        return (
          <div
            className={_concat(
              'Component_14m',
              active && 'active_tla',
              className
            )}
          />
        );
      };
    `);
    expect(output.css).toMatchInlineSnapshot(`
      .Component_14m {
        color: gray;
      }
      .active_tla {
        color: blue;
      }
      @media (min-width: 768px) {
        .active_tla {
          color: navy;
        }
      }
    `);
  });

  it("will handle breakpoint on component with multiple elements", async () => {
    const output = await parser(`
      const Component = () => {
        header: {
          fontSize: 20;
          $lg: { fontSize: 32; }
        }

        body: {
          fontSize: 14;
          $lg: { fontSize: 18; }
        }

        return (
          <div>
            <header />
            <body />
          </div>
        )
      }
    `);

    expect(output.css).toMatchInlineSnapshot(`
      .header_tla {
        font-size: 20;
      }
      .body_tla {
        font-size: 14;
      }
      @media (min-width: 1024px) {
        .header_tla {
          font-size: 32;
        }
        .body_tla {
          font-size: 18;
        }
      }
    `);
  });

  it("will handle pseudo on element with existing styles", async () => {
    const output = await parser(`
      const Component = () => {
        color: red;
        backgroundColor: white;

        $hover: {
          color: blue;
          backgroundColor: gray;
        }

        $focus: {
          outline: none;
          color: green;
        }

        return <div />
      }
    `);

    expect(output.css).toMatchInlineSnapshot(`
      .Component_14m {
        color: red;
        background-color: white;
      }
      .Component_14m:hover {
        color: blue;
        background-color: gray;
      }
      .Component_14m:focus {
        outline: none;
        color: green;
      }
    `);
  });
});
