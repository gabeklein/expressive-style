import { expect, it } from "vitest";

import { background } from "./color";

it("applies rgb background", () => {
  expect(background(["rgb", 255, 0, 0])).toEqual({
    backgroundColor: "rgb(255,0,0)",
  });
});

it("applies rgba background", () => {
  expect(background(["rgba", 255, 0, 0, 0.5])).toEqual({
    backgroundColor: "rgba(255,0,0,0.5)",
  });
});

it("applies hsl background", () => {
  expect(background(["hsl", 120, 50, 50])).toEqual({
    backgroundColor: "hsl(120,50%,50%)",
  });
});

it("applies hsla background", () => {
  expect(background(["hsla", 120, 50, 50, 0.5])).toEqual({
    backgroundColor: "hsla(120,50%,50%,0.5)",
  });
});

it("defaults alpha to 1 for rgb and hsl", () => {
  expect(background(["rgb", 0, 0, 0])).toEqual({
    backgroundColor: "rgb(0,0,0)",
  });

  expect(background(["hsl", 0, 0, 0])).toEqual({
    backgroundColor: "hsl(0,0%,0%)",
  });
});

it("passes through plain values", () => {
  expect(background("red")).toEqual({
    background: ["red"],
  });
});
