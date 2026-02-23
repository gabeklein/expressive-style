import type { PluginObj } from "@babel/core";

import { Preset, State } from "..";
import { t } from "../babel";
import { Context, getUsing } from "../jsxPlugin";
import { toSelector, toStylesheet } from "./css";
import {
  addClassName,
  getClassName,
  getComponentProp,
  uniqueIdentifier,
} from "./jsx";

export function CSSPlugin(
  _compiler: any,
  options: Preset.Options = {},
): PluginObj<State> {
  const { cssModule } = options;

  return {
    visitor: {
      Program: {
        enter(path, state) {
          const { metadata } = state.file;

          if (cssModule)
            Object.defineProperty(metadata, "cssModuleId", {
              value: uniqueIdentifier(path, "css"),
            });

          Object.defineProperties(state.file.metadata, {
            styles: {
              value: new Map<string, Context>(),
            },
            css: {
              get(this: Preset.MetaData) {
                return toStylesheet(this.styles);
              },
            },
          });
        },
        exit(path, state) {
          const { styles, cssModuleId } = state.file.metadata;
          let hasStyles = false;

          for (const context of styles.values())
            if (context.props.size || context.children.size) {
              hasStyles = true;
              break;
            }

          if (!cssModuleId || !cssModule || !hasStyles) return;

          path.unshiftContainer(
            "body",
            t.importDeclaration(
              [t.importDefaultSpecifier(cssModuleId)],
              t.stringLiteral(cssModule),
            ),
          );
        },
      },
      JSXElement(path, state) {
        const { cssModuleId } = state.file.metadata;

        const using = getUsing(path);

        if (!using.size) return;

        for (const context of using) {
          const className = getClassName(context, cssModuleId);

          if (className) addClassName(path, className, state);

          if (context.path.isFunction()) {
            const className = getComponentProp(context.path, "className");

            if (className) addClassName(path, className, state);
          }
        }

        for (const context of using) {
          context.children.forEach((x) => using.add(x));

          const { styles } = state.file.metadata as Preset.MetaData;
          const key = toSelector(context);

          styles.set(key, context);
        }
      },
    },
  };
}
