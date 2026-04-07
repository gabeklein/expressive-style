import { expect, it } from "vitest";
import { parser } from "./adapter";

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
    .Component_2gw {
      font-size: 14px;
    }
    @media (min-width: 640px) {
    .Component_2gw {
      font-size: 16px;
    }
    }
    @media (min-width: 768px) {
    .Component_2gw {
      font-size: 18px;
    }
    }
    @media (min-width: 1024px) {
    .Component_2gw {
      font-size: 22px;
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
      font-size: 24px;
    }
    @media (min-width: 768px) {
    .title_tla {
      font-size: 36px;
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
    .Component_22n {
      color: red;
    }
    .Component_22n:hover {
      color: blue;
    }
    .Component_22n:hover::after {
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
            'Component_29h',
            active && 'active_tla',
            className
          )}
        />
      );
    };
  `);
  expect(output.css).toMatchInlineSnapshot(`
    .Component_29h {
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
      font-size: 20px;
    }
    .body_tla {
      font-size: 14px;
    }
    @media (min-width: 1024px) {
    .header_tla {
      font-size: 32px;
    }
    .body_tla {
      font-size: 18px;
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
    .Component_17l {
      color: red;
      background-color: white;
    }
    .Component_17l:hover {
      color: blue;
      background-color: gray;
    }
    .Component_17l:focus {
      outline: none;
      color: green;
    }
  `);
});
