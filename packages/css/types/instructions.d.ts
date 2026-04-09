/**
 * Built-in instruction labels (used with $ prefix).
 *
 * Instructions create nested contexts with CSS conditions
 * (pseudo-selectors, media queries, etc).
 */
interface BuiltInInstructions {
  // Pseudo-selectors
  /** :hover pseudo-class */
  hover(): void;
  /** :focus pseudo-class */
  focus(): void;
  /** :active pseudo-class */
  active(): void;
  /** :visited pseudo-class */
  visited(): void;
  /** :disabled pseudo-class */
  disabled(): void;
  /** :checked pseudo-class */
  checked(): void;
  /** :first-child pseudo-class */
  firstChild(): void;
  /** :last-child pseudo-class */
  lastChild(): void;
  /** :first-of-type pseudo-class */
  firstOfType(): void;
  /** :last-of-type pseudo-class */
  lastOfType(): void;
  /** :only-child pseudo-class */
  onlyChild(): void;
  /** :only-of-type pseudo-class */
  onlyOfType(): void;
  /** :empty pseudo-class */
  empty(): void;
  /** :link pseudo-class */
  link(): void;
  /** :any-link pseudo-class */
  anyLink(): void;
  /** :focus-visible pseudo-class */
  focusVisible(): void;
  /** :focus-within pseudo-class */
  focusWithin(): void;
  /** :placeholder-shown pseudo-class */
  placeholderShown(): void;
  /** :default pseudo-class */
  default(): void;
  /** :enabled pseudo-class */
  enabled(): void;
  /** :read-only pseudo-class */
  readOnly(): void;
  /** :read-write pseudo-class */
  readWrite(): void;
  /** :required pseudo-class */
  required(): void;
  /** :optional pseudo-class */
  optional(): void;
  /** :valid pseudo-class */
  valid(): void;
  /** :invalid pseudo-class */
  invalid(): void;
  /** :in-range pseudo-class */
  inRange(): void;
  /** :out-of-range pseudo-class */
  outOfRange(): void;

  // Pseudo-elements
  /** ::before pseudo-element */
  before(): void;
  /** ::after pseudo-element */
  after(): void;
  /** ::first-line pseudo-element */
  firstLine(): void;
  /** ::first-letter pseudo-element */
  firstLetter(): void;
  /** ::selection pseudo-element */
  selection(): void;
  /** ::placeholder pseudo-element */
  placeholder(): void;

  // Breakpoints
  /** @media (min-width: 640px) */
  sm(): void;
  /** @media (min-width: 768px) */
  md(): void;
  /** @media (min-width: 1024px) */
  lg(): void;
  /** @media (min-width: 1280px) */
  xl(): void;

  // Special
  /** > * child selector */
  children(): void;
  /** :nth-child(even) */
  even(): void;
  /** :nth-child(odd) */
  odd(): void;
  /** @media (prefers-color-scheme: dark) */
  dark(): void;
  /** @media (prefers-color-scheme: light) */
  light(): void;
}
