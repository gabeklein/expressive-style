import { expect, it } from "vitest";

import { border, borderTop, borderLeft, borderRight, borderBottom } from "./border";

it("defaults to black solid 1", () => {
  expect(border()).toEqual({ border: ["black", "solid", "1px"] });
});

it("applies color with defaults", () => {
  expect(border("red")).toEqual({ border: ["red", "solid", "1px"] });
});

it("applies color and numeric width", () => {
  expect(border("red", 2)).toEqual({ border: ["red", "solid", "2px"] });
});

it("applies color, width, and style", () => {
  expect(border("blue", 3, "dashed")).toEqual({ border: ["blue", "dashed", "3px"] });
});

it("passes through string with spaces as-is", () => {
  expect(border("1px solid red")).toEqual({ border: "1px solid red" });
});

it("returns none directly", () => {
  expect(border("none")).toEqual({ border: "none" });
});

it("returns transparent directly", () => {
  expect(border("transparent")).toEqual({ border: "transparent" });
});

it("appends px to numeric width", () => {
  expect(border("black", 5)).toEqual({ border: ["black", "solid", "5px"] });
});

it("preserves string width with units", () => {
  expect(border("black", "2em")).toEqual({ border: ["black", "solid", "2em"] });
});

it("borderTop targets correct key", () => {
  expect(borderTop("red")).toEqual({ borderTop: ["red", "solid", "1px"] });
});

it("borderLeft targets correct key", () => {
  expect(borderLeft("red")).toEqual({ borderLeft: ["red", "solid", "1px"] });
});

it("borderRight targets correct key", () => {
  expect(borderRight("red")).toEqual({ borderRight: ["red", "solid", "1px"] });
});

it("borderBottom targets correct key", () => {
  expect(borderBottom("red")).toEqual({ borderBottom: ["red", "solid", "1px"] });
});
