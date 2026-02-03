import { NodePath, PluginObj, template, types as t } from "@babel/core";

import { Preset, State } from "..";
import { Context, getUsing } from "../jsxPlugin";
import { toSelector, toStylesheet } from "./css";
import { addClassName, fixTagName, getClassName } from "./jsx";
import { uniqueIdentifier } from "./uid";

const classNamesHelper = template.ast`
  (...args) => args.filter(Boolean).join(" ");
` as t.ExpressionStatement;

export function CSSPlugin(
  _compiler: any,
  options: Preset.Options = {}
): PluginObj<State> {
  const { cssModule } = options;
  let getHelper: () => t.Identifier;

  return {
    visitor: {
      JSXElement(path, state) {
        const { cssModuleId } = state.file.metadata;

        const using = getUsing(path);

        fixTagName(path);

        if (!using.size) return;

        let forward: NodePath<t.Function> | undefined;

        for (const define of using) {
          const className = getClassName(define, cssModuleId);

          if (className) addClassName(path, className, getHelper);

          if (define.path.isFunction()) forward = define.path;
        }

        for (const context of using) {
          const { styles } = state.file.metadata as Preset.MetaData;
          const key = toSelector(context);

          context.children.forEach((x) => using.add(x));
          styles.set(key, context);
        }

        if (forward){
          const className = getComponentProp(path, "className", true);

          if(className)
            addClassName(path, className, getHelper);
        }
      },
      Program: {
        enter(path, state) {
          const { metadata } = state.file;

          getHelper = () => {
            let helper = state.classNameHelper as t.Identifier;

            if (!helper) {
              helper = state.classNameHelper = uniqueIdentifier(
                path,
                "classNames"
              );
              path.unshiftContainer(
                "body",
                t.variableDeclaration("const", [
                  t.variableDeclarator(helper, classNamesHelper.expression),
                ])
              );
            }

            return helper;
          };

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
                return toStylesheet(this.styles.values());
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
    },
  };
}

function getComponentProp(path: NodePath, name: string, ignoreExisting = false) {
  const func = path.find((x) => x.isFunction()) as NodePath<t.Function>;
  let [props] = func.node.params;

  if (t.isObjectPattern(props)) {
    const { properties } = props;

    const prop = properties.find(
      (x) => t.isObjectProperty(x) && t.isIdentifier(x.key, { name })
    ) as t.ObjectProperty | undefined;

    if (prop) 
      return ignoreExisting ? false : prop.value as t.Identifier;

    const id = t.identifier(name);

    properties.unshift(t.objectProperty(id, id, false, true));

    return id;
  } else if (!props) {
    props = uniqueIdentifier(path, "props");
    func.unshiftContainer("params", props);
  }

  if (t.isIdentifier(props))
    return t.memberExpression(props, t.identifier(name));

  throw new Error(`Expected an Identifier or ObjectPattern, got ${props.type}`);
}