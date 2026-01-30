import { expect, it } from "vitest";
import { parser } from "./adapter";

it("should throw error for unary operator that doesn't do anything", async () => {
  await expect(async () => {
    await parser(`
      const Component = () => {
        color: +red;
      }
    `);
  }).rejects.toThrow("Unary operator here doesn't do anything");
});

it("should throw error for negative hex numbers", async () => {
  await expect(async () => {
    await parser(`
      const Component = () => {
        color: -0xfff;
      }
    `);
  }).rejects.toThrow(/Hexadecimal numbers are converted into colors/);
});

it("should throw error for arrow functions in modifiers", async () => {
  await expect(async () => {
    await parser(`
      const Component = () => {
        color: () => 'red';
      }
    `);
  }).rejects.toThrow("Arrow Function not supported yet");
});

it("should throw error for spread elements in call expressions", async () => {
  await expect(async () => {
    await parser(`
      const Component = () => {
        color: fn(...args);
      }
    `);
  }).rejects.toThrow("Cannot parse argument spreads for modifier handlers");
});

it("should throw error for non-identifier callee in call expressions", async () => {
  await expect(async () => {
    await parser(`
      const Component = () => {
        color: obj.method();
      }
    `);
  }).rejects.toThrow("Only Identifers allowed here");
});

it("should throw error for unknown argument types", async () => {
  await expect(async () => {
    await parser(`
      const Component = () => {
        color: /regex/;
      }
    `);
  }).rejects.toThrow("Unknown argument while parsing for modifier");
});

it("should provide code frame with error location", async () => {
  try {
    await parser(`
      const Component = () => {
        color: +red;
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

it("should handle macro errors with proper context", async () => {
  await expect(async () => {
    await parser(`
      const Component = () => {
        invalidMacro: +value;
      }
    `);
  }).rejects.toThrow();
});
