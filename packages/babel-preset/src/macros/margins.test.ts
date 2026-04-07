import { expect, it } from "vitest";

import {
  margin, padding,
  marginTop, marginL, marginRight, marginB,
  paddingTop, paddingL, paddingRight, paddingB,
  paddingH, paddingV, marginH, marginV,
} from "./margins";

it("margin with single number", () => {
  expect(margin(10)).toEqual({ margin: "10px" });
});

it("margin with two values", () => {
  expect(margin(10, 20)).toEqual({ margin: "10px 20px" });
});

it("margin passes auto through", () => {
  expect(margin("auto")).toEqual({ margin: "auto" });
});

it("margin passes none through", () => {
  expect(margin("none")).toEqual({ margin: "none" });
});

it("margin passes string with spaces through", () => {
  expect(margin("10px 20px")).toEqual({ margin: "10px 20px" });
});

it("padding with four values", () => {
  expect(padding(1, 2, 3, 4)).toEqual({ padding: "1px 2px 3px 4px" });
});

it("marginTop applies unit", () => {
  expect(marginTop(10)).toEqual({ marginTop: "10px" });
});

it("marginL with custom unit", () => {
  expect(marginL(50, "%")).toEqual({ marginLeft: "50%" });
});

it("marginRight passes string through", () => {
  expect(marginRight("2em")).toEqual({ marginRight: "2em" });
});

it("marginB applies default px", () => {
  expect(marginB(8)).toEqual({ marginBottom: "8px" });
});

it("paddingTop applies unit", () => {
  expect(paddingTop(12)).toEqual({ paddingTop: "12px" });
});

it("paddingL with custom unit", () => {
  expect(paddingL(5, "rem")).toEqual({ paddingLeft: "5rem" });
});

it("paddingRight passes string through", () => {
  expect(paddingRight("1em")).toEqual({ paddingRight: "1em" });
});

it("paddingB applies default px", () => {
  expect(paddingB(16)).toEqual({ paddingBottom: "16px" });
});

it("paddingH with single value sets both sides", () => {
  expect(paddingH(20)).toEqual({ paddingLeft: 20, paddingRight: 20 });
});

it("paddingH with two values sets each side", () => {
  expect(paddingH(10, 30)).toEqual({ paddingLeft: 10, paddingRight: 30 });
});

it("paddingV with single value sets both sides", () => {
  expect(paddingV(15)).toEqual({ paddingTop: 15, paddingBottom: 15 });
});

it("marginH with two values sets each side", () => {
  expect(marginH(5, 25)).toEqual({ marginLeft: 5, marginRight: 25 });
});

it("marginV with single value sets both sides", () => {
  expect(marginV("auto")).toEqual({ marginTop: "auto", marginBottom: "auto" });
});
