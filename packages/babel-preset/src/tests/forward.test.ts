import { expect, it } from "vitest";

import { parser } from "./adapter";

it("will forward className", async () => {
  const output = await parser(`
    const Component = () => {
      color: blue;

      <this />
    }
  `);

  expect(output.code).toMatchInlineSnapshot(`
    const Component = (props) => (
      <div
        className={classNames(props.className, 'Component_240')}
      />
    );
  `);
});

it("will forward from existing props", async () => {
  const output = await parser(`
    const Component = (props) => {
      color: blue;

      <this something={props.something} />
    }
  `);

  expect(output.code).toMatchInlineSnapshot(`
    const Component = (props) => (
      <div
        something={props.something}
        className={classNames(props.className, 'Component_2a2')}
      />
    );
  `);
});

it("will forward from destructured props", async () => {
  const output = await parser(`
    const Component = ({ something }) => {
      color: blue;

      <this something={something} />
    }
  `);

  expect(output.code).toMatchInlineSnapshot(`
    const Component = ({ className, something }) => (
      <div
        something={something}
        className={classNames(className, 'Component_18f')}
      />
    );
  `);
});

it("will return this if no JSX", async () => {
  const output = await parser(`
    const Component = () => {
      color: red;
      width: "16px";
      background: "blue";
    }
  `);

  expect(output.code).toMatchInlineSnapshot(`
    const Component = (props) => (
      <div
        className={classNames(props.className, 'Component_2jp')}
      />
    );
  `);
});

it("will forward className to this attribute", async () => {
  const output = await parser(`
    const Component = () => {
      color: blue;

      <input this />
    }
  `);

  expect(output.code).toMatchInlineSnapshot(`
    const Component = (props) => (
      <input
        className={classNames(props.className, 'Component_16v')}
      />
    );
  `);
});

it("will forward props with no styles", async () => {
  const output = await parser(`
    export const Row = () => {
      <this />
    }
  `);

  expect(output.code).toMatchInlineSnapshot(
    `
    export const Row = (props) => (
      <div className={props.className} />
    );
  `
  );
});

it("will apply styles by wrapping fragment", async () => {
  const output = await parser(`
    export const Row = () => {
      color: red;
    
      <>
        <span>Something</span>
        <span>Something</span>
      </>
    }
  `);

  expect(output.code).toMatchInlineSnapshot(`
    export const Row = (props) => (
      <div className={classNames(props.className, 'Row_2gs')}>
        <span>Something</span>
        <span>Something</span>
      </div>
    );
  `);
});

it("will apply styles by wrapping fragment with this", async () => {
  const output = await parser(`
    const Steps = ({ steps, currentStep }) => {
      color: red;

      return (
        <>
          {steps.map((step, i) => (
            <Step key={i} index={i} current={currentStep}>
              {step}
            </Step>
          ))}
          <DottedLine />
        </>
      );
    };
  `);

  expect(output.code).toMatchInlineSnapshot(`
    const Steps = ({ className, steps, currentStep }) => {
      return (
        <div className={classNames(className, 'Steps_11k')}>
          {steps.map((step, i) => (
            <Step key={i} index={i} current={currentStep}>
              {step}
            </Step>
          ))}
          <DottedLine />
        </div>
      );
    };
  `);
});

it("will not wrap an expression in element", async () => {
  const output = await parser(`
    const Test = () => {
      display: flex;

      return (
        <>
          {true && <div />}
        </>
      );
    };
  `);

  expect(output.code).toMatchInlineSnapshot(`
    const Test = (props) => {
      return (
        <div className={classNames(props.className, 'Test_2b1')}>
          {true && <div />}
        </div>
      );
    };
  `);
});
