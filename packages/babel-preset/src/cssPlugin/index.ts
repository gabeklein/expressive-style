import { NodePath, PluginObj, types as t } from "@babel/core";

import { Preset, State } from "..";
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
  options: Preset.Options = {}
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

          if (!cssModuleId || !cssModule || !styles.size) return;

          path.unshiftContainer(
            "body",
            t.importDeclaration(
              [t.importDefaultSpecifier(cssModuleId)],
              t.stringLiteral(cssModule)
            )
          );
        },
      },
      JSXElement(path, state) {
        const { cssModuleId } = state.file.metadata;

        const using = getUsing(path);

        if (!using.size) return;

        let forward: NodePath<t.Function> | undefined;

        for (const define of using) {
          const className = getClassName(define, cssModuleId);

          if (className) addClassName(path, className, state);

          if (define.path.isFunction()) forward = define.path;
        }

        for (const context of using) {
          const { styles } = state.file.metadata as Preset.MetaData;
          const key = toSelector(context);

          context.children.forEach((x) => using.add(x));
          styles.set(key, context);
        }

        if (forward) {
          const className = getComponentProp(forward, "className");

          if (className) addClassName(path, className, state);
        }
      },
    },
  };
}
