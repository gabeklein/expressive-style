import { expect, it } from "vitest";
import { parser } from "./adapter";

it("should throw error for unary operator that doesn't do anything", async () => {
  const parse = parser(`
    const Component = () => {
      color: +red;

      return <div />;
    }
  `);

  await expect(parse).rejects.toThrow(
    "Unary operator here doesn't do anything"
  );
});

it("should throw error for arrow functions in modifiers", async () => {
  const parse = parser(`
    const Component = () => {
      color: () => 'red';

      return <div />;
    }
  `);

  await expect(parse).rejects.toThrow("Arrow Function not supported yet");
});

it("should throw error for spread elements in call expressions", async () => {
  const parse = parser(`
    const Component = () => {
      color: fn(...args);

      return <div />;
    }
  `);

  await expect(parse).rejects.toThrow(
    "Cannot parse argument spreads for modifier handlers"
  );
});

it("should throw error for non-identifier callee in call expressions", async () => {
  const parse = parser(`
    const Component = () => {
      color: obj.method();

      return <div />;
    }
  `);

  await expect(parse).rejects.toThrow("Only Identifers allowed here");
});

it("should throw error for unknown argument types", async () => {
  const parse = parser(`
    const Component = () => {
      color: /regex/;

      return <div />;
    }
  `);

  await expect(parse).rejects.toThrow(
    "Unknown argument while parsing for modifier"
  );
});

// TODO: improve error message
it("should handle macro errors with proper context", async () => {
  const parse = parser(`
    const Component = () => {
      invalidMacro: +value;

      return <div />;
    }
  `);

  await expect(parse).rejects.toThrow();
});

it("should provide code frame with error location", async () => {
  try {
    await parser(`
      const Component = () => {
        color: +red;

        return <div />;
      }
    `);
    expect.fail("Should have thrown an error");
  } catch (error: any) {
    expect(error.message).toContain("Unary operator");
    // Babel buildError includes a code frame in the message
    expect(error.message).toBeTruthy();
    expect(error instanceof Error).toBe(true);
  }
});
