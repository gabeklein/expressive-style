/**
 * Common CSS properties recognized as labeled statements.
 *
 * This is a scaffolding set of ~20 common properties.
 * Values accept numbers (auto-converted to px/em) and strings.
 */
interface CSSProperties {
  /** Sets the display type of an element */
  display(value: CSSValue): void;
  /** Sets the positioning scheme */
  position(value: CSSValue): void;
  /** Sets the text color */
  color(value: CSSValue): void;
  /** Sets the background */
  background(...values: CSSValue[]): void;
  /** Sets the background color */
  backgroundColor(value: CSSValue): void;
  /** Sets the opacity */
  opacity(value: CSSValue): void;
  /** Sets the overflow behavior */
  overflow(value: CSSValue): void;
  /** Sets the cursor style */
  cursor(value: CSSValue): void;
  /** Sets visibility */
  visibility(value: CSSValue): void;
  /** Sets the z-index stacking order */
  zIndex(value: CSSValue): void;
  /** Sets the flex property */
  flex(...values: CSSValue[]): void;
  /** Sets the flex-direction */
  flexDirection(value: CSSValue): void;
  /** Sets flex-wrap */
  flexWrap(value: CSSValue): void;
  /** Sets justify-content */
  justifyContent(value: CSSValue): void;
  /** Sets align-items */
  alignItems(value: CSSValue): void;
  /** Sets align-self */
  alignSelf(value: CSSValue): void;
  /** Sets the text-align */
  textAlign(value: CSSValue): void;
  /** Sets text-decoration */
  textDecoration(value: CSSValue): void;
  /** Sets text-transform */
  textTransform(value: CSSValue): void;
  /** Sets the transition */
  transition(...values: CSSValue[]): void;
  /** Sets the letter-spacing */
  letterSpacing(value: CSSValue): void;
  /** Sets the white-space behavior */
  whiteSpace(value: CSSValue): void;
  /** Sets the font-style */
  fontStyle(value: CSSValue): void;
  /** Sets the font-weight */
  fontWeight(value: CSSValue): void;
  /** Sets the box-sizing */
  boxSizing(value: CSSValue): void;
  /** Sets the border-color */
  borderColor(value: CSSValue): void;
  /** Sets the grid-template-columns */
  gridTemplateColumns(value: CSSValue): void;
  /** Sets the grid-template-rows */
  gridTemplateRows(value: CSSValue): void;
}
