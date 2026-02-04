import { expect, it } from "vitest";

import { transform } from "./transform";

it("applies px to translate and perspective functions", () => {
  expect(
    transform(
      ["translateX", 10],
      ["translateY", 20],
      ["translateZ", 5],
      ["perspective", 500]
    )
  ).toEqual({
    transform:
      "translateX(10px) translateY(20px) translateZ(5px) perspective(500px)",
  });

  expect(transform(["translate", 10, 20], ["translate3d", 10, 20, 30])).toEqual(
    {
      transform: "translate(10px, 20px) translate3d(10px, 20px, 30px)",
    }
  );
});

it("applies deg to rotate and skew functions", () => {
  expect(
    transform(
      ["rotate", 45],
      ["rotateX", 90],
      ["rotateY", 180],
      ["rotateZ", 30]
    )
  ).toEqual({
    transform: "rotate(45deg) rotateX(90deg) rotateY(180deg) rotateZ(30deg)",
  });

  expect(transform(["skewX", 15], ["skewY", 10], ["skew", 15, 10])).toEqual({
    transform: "skewX(15deg) skewY(10deg) skew(15deg, 10deg)",
  });
});

it("leaves scale functions unitless", () => {
  expect(
    transform(
      ["scale", 2],
      ["scaleX", 1.5],
      ["scaleY", 0.8],
      ["scale3d", 2, 3, 1]
    )
  ).toEqual({
    transform: "scale(2) scaleX(1.5) scaleY(0.8) scale3d(2, 3, 1)",
  });
});

it("applies deg only to the angle in rotate3d", () => {
  expect(transform(["rotate3d", 1, 0, 0, 45])).toEqual({
    transform: "rotate3d(1, 0, 0, 45deg)",
  });
});

it("handles zero, negatives, and string passthrough", () => {
  expect(
    transform(["translateX", 0], ["translateX", -20], ["rotate", -45])
  ).toEqual({
    transform: "translateX(0) translateX(-20px) rotate(-45deg)",
  });

  expect(transform("none")).toEqual({ transform: "none" });
  expect(transform(["rotate", "45deg"])).toEqual({
    transform: "rotate(45deg)",
  });
});
