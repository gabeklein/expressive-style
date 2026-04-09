/**
 * Built-in macro signatures from @expressive/css.
 *
 * These override or extend standard CSS properties with
 * enhanced shorthand behavior.
 */
interface BuiltInMacros {
  // border.ts

  /**
   * Sets `border` with colour, width, and style.
   * @example `border: 0xddd;` -> `border: #ddd solid 1px;`
   * @example `border: 0x333, 2;` -> `border: #333 solid 2px;`
   */
  border(...args: (string | number)[]): void;
  /** Sets `border-top` */
  borderTop(...args: (string | number)[]): void;
  /** Sets `border-left` */
  borderLeft(...args: (string | number)[]): void;
  /** Sets `border-right` */
  borderRight(...args: (string | number)[]): void;
  /** Sets `border-bottom` */
  borderBottom(...args: (string | number)[]): void;
  /** Shorthand for `borderTop` */
  borderT(...args: (string | number)[]): void;
  /** Shorthand for `borderLeft` */
  borderL(...args: (string | number)[]): void;
  /** Shorthand for `borderRight` */
  borderR(...args: (string | number)[]): void;
  /** Shorthand for `borderBottom` */
  borderB(...args: (string | number)[]): void;

  // color.ts

  /**
   * Sets the background, with support for rgb/rgba/hsl/hsla function calls.
   * @example `bg: 0xff0000;` -> `background: #ff0000;`
   */
  bg(...args: CSSValue[]): void;

  // flex.ts

  /**
   * Sets `display: flex` and configures direction and alignment.
   * @example `flexAlign: right, center;` -> flex row, centered on both axes
   * @example `flexAlign: center;` -> flex with justify + align center
   */
  flexAlign(...args: string[]): void;

  // font.ts

  /**
   * Sets font properties by detecting argument types.
   * Multiples of 100 -> font-weight, other numbers -> font-size, strings -> font-family.
   * @example `font: 700, 18;` -> `font-weight: 700; font-size: 18px;`
   */
  font(...args: (number | string)[]): void;
  /** Sets font-family, quoting names with spaces */
  fontFamily(...args: string[]): void;
  /** Alias for fontFamily */
  family(...args: string[]): void;

  // grid.ts

  /** Sets both grid-row and grid-column */
  gridArea(rows: unknown, cols: unknown): void;
  /** Sets grid-row */
  gridRow(...args: unknown[]): void;
  /** Sets grid-column */
  gridColumn(...args: unknown[]): void;
  /** Sets display:grid and grid-template-rows */
  gridRows(...args: unknown[]): void;
  /** Sets display:grid and grid-template-columns */
  gridColumns(...args: unknown[]): void;

  // image.ts

  /**
   * Sets background-image to url() wrapping the given path.
   * @example `image: "/assets/photo.png";`
   */
  image(url: string): void;
  /** Sets background-image with relative path support */
  backgroundImage(from: string): void;
  /**
   * Sets -webkit-mask-image for SVG icon masking.
   * @example `icon: "icons/arrow";` -> mask with arrow.svg
   */
  icon(mask?: string, color?: string | number): void;

  // margins.ts

  /**
   * Sets margin shorthand.
   * @example `margin: 10, 20;` -> `margin: 10px 20px;`
   */
  margin(...args: (string | number)[]): void;
  /**
   * Sets padding shorthand.
   * @example `padding: 10, 20;` -> `padding: 10px 20px;`
   */
  padding(...args: (string | number)[]): void;
  /** Sets margin-top */
  marginTop(value: number | string, unit?: string): void;
  /** Sets margin-left */
  marginLeft(value: number | string, unit?: string): void;
  /** Sets margin-right */
  marginRight(value: number | string, unit?: string): void;
  /** Sets margin-bottom */
  marginBottom(value: number | string, unit?: string): void;
  /** Shorthand for marginTop */
  marginT(value: number | string, unit?: string): void;
  /** Shorthand for marginLeft */
  marginL(value: number | string, unit?: string): void;
  /** Shorthand for marginRight */
  marginR(value: number | string, unit?: string): void;
  /** Shorthand for marginBottom */
  marginB(value: number | string, unit?: string): void;
  /** Sets padding-top */
  paddingTop(value: number | string, unit?: string): void;
  /** Sets padding-left */
  paddingLeft(value: number | string, unit?: string): void;
  /** Sets padding-right */
  paddingRight(value: number | string, unit?: string): void;
  /** Sets padding-bottom */
  paddingBottom(value: number | string, unit?: string): void;
  /** Shorthand for paddingTop */
  paddingT(value: number | string, unit?: string): void;
  /** Shorthand for paddingLeft */
  paddingL(value: number | string, unit?: string): void;
  /** Shorthand for paddingRight */
  paddingR(value: number | string, unit?: string): void;
  /** Shorthand for paddingBottom */
  paddingB(value: number | string, unit?: string): void;
  /** Sets paddingLeft and paddingRight */
  paddingHorizontal(v1: number | string, v2?: number | string): void;
  /** Sets paddingTop and paddingBottom */
  paddingVertical(v1: number | string, v2?: number | string): void;
  /** Sets marginLeft and marginRight */
  marginHorizontal(v1: number | string, v2?: number | string): void;
  /** Sets marginTop and marginBottom */
  marginVertical(v1: number | string, v2?: number | string): void;
  /** Shorthand for paddingHorizontal */
  paddingH(v1: number | string, v2?: number | string): void;
  /** Shorthand for paddingVertical */
  paddingV(v1: number | string, v2?: number | string): void;
  /** Shorthand for marginHorizontal */
  marginH(v1: number | string, v2?: number | string): void;
  /** Shorthand for marginVertical */
  marginV(v1: number | string, v2?: number | string): void;

  // outline.ts

  /**
   * Sets outline with sensible defaults.
   * @example `outline: red;` -> `outline: 1px dashed red;`
   * @example `outline: none;` -> `outline: none;`
   */
  outline(color?: string, width?: string | number, ...rest: (string | number)[]): void;

  // position.ts

  /**
   * Sets `position: absolute` with optional inset values.
   * @example `absolute: fill;` -> all insets 0
   * @example `absolute: 10, 20;` -> vertical 10, horizontal 20
   */
  absolute(...args: (number | string)[]): void;
  /**
   * Sets `position: fixed` with optional inset values.
   * @example `fixed: fill;` -> all insets 0
   */
  fixed(...args: (number | string)[]): void;
  /** Sets `position: relative` */
  relative(): void;

  // radius.ts

  /**
   * Sets border-radius with support for directional and keyword values.
   * @example `radius: round;` -> `border-radius: 999px;`
   * @example `radius: 8;` -> `border-radius: 8px;`
   * @example `radius: top, 8;` -> top corners 8px, bottom 0
   */
  radius(dir: string | number, r1?: number, r2?: number): void;
  /**
   * Creates a perfect circle.
   * @example `circle: 100;` -> `border-radius: 50px; width: 100px; height: 100px;`
   */
  circle(diameter: number): void;

  // scalar.ts - numeric values with auto unit

  /** Sets gap with auto unit */
  gap(value: number | string, unit?: string): void;
  /** Sets top with auto unit */
  top(value: number | string, unit?: string): void;
  /** Sets left with auto unit */
  left(value: number | string, unit?: string): void;
  /** Sets right with auto unit */
  right(value: number | string, unit?: string): void;
  /** Sets bottom with auto unit */
  bottom(value: number | string, unit?: string): void;
  /** Sets width with auto unit */
  width(value: number | string, unit?: string): void;
  /** Sets height with auto unit */
  height(value: number | string, unit?: string): void;
  /** Sets max-width with auto unit */
  maxWidth(value: number | string, unit?: string): void;
  /** Sets max-height with auto unit */
  maxHeight(value: number | string, unit?: string): void;
  /** Sets min-width with auto unit */
  minWidth(value: number | string, unit?: string): void;
  /** Sets min-height with auto unit */
  minHeight(value: number | string, unit?: string): void;
  /** Sets font-size with auto unit */
  fontSize(value: number | string, unit?: string): void;
  /** Sets line-height with auto unit */
  lineHeight(value: number | string, unit?: string): void;
  /** Sets outline-width with auto unit */
  outlineWidth(value: number | string, unit?: string): void;
  /** Sets border-radius with auto unit */
  borderRadius(value: number | string, unit?: string): void;
  /** Sets background-size with auto unit */
  backgroundSize(value: number | string, unit?: string): void;

  // shadow.ts

  /**
   * Sets box-shadow with sensible defaults.
   * @example `shadow: 0xccc;` -> `box-shadow: 2px 2px 10px #ccc;`
   * @example `shadow: none;` -> `box-shadow: none;`
   */
  shadow(color: string | number, radius?: number, x?: number, y?: number): void;

  // size.ts

  /**
   * Sets width and height.
   * @example `size: 100;` -> `width: 100px; height: 100px;`
   * @example `size: 200, 100;` -> `width: 200px; height: 100px;`
   */
  size(x: number | string, y?: number | string, unit?: string): void;
  /** Sets min-width and min-height */
  minSize(x: number | string, y?: number | string, unit?: string): void;
  /** Sets max-width and max-height */
  maxSize(x: number | string, y?: number | string, unit?: string): void;
  /** Sets width and height with aspect-ratio scaling */
  aspectSize(x: number, y: number, unit?: string): void;

  // transform.ts

  /**
   * Builds a CSS transform from function descriptors.
   * @example `transform: translateX(40);` -> `transform: translateX(40px);`
   * @example `transform: rotate(45);` -> `transform: rotate(45deg);`
   */
  transform(...args: (string | [string, ...(number | string)[]])[]): void;

  // gradient.ts

  /**
   * Generates a linear-gradient with easing-curve color stops.
   * @example `easingGradient: toRight, "black", easeInOut, "white";`
   */
  easingGradient(direction: string, from: string, timing: string, to: string, stops?: number): void;
}
