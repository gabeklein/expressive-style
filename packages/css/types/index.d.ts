/// <reference path="./css.d.ts" />
/// <reference path="./macros.d.ts" />
/// <reference path="./instructions.d.ts" />

type CSSValue = string | number;

declare global {
  namespace Expressive {
    /**
     * All recognized CSS property and macro labels.
     *
     * Augment this interface to register custom macros:
     * ```typescript
     * declare global {
     *   namespace Expressive {
     *     interface Properties {
     *       myMacro(value: string): void;
     *     }
     *   }
     * }
     * ```
     */
    interface Properties extends CSSProperties, BuiltInMacros {}

    /**
     * All recognized instruction labels (used with $ prefix in source).
     *
     * Augment this interface to register custom instructions:
     * ```typescript
     * declare global {
     *   namespace Expressive {
     *     interface Instructions {
     *       myBreakpoint(): void;
     *     }
     *   }
     * }
     * ```
     */
    interface Instructions extends BuiltInInstructions {}
  }
}
