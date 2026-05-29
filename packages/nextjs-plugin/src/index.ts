import ExpressiveJSXPlugin, { Options } from "@expressive/webpack-plugin-style";

export interface ExpressiveNextPluginOptions extends Options {}

type NextConfig = Record<string, any>;

/**
 * Next.js plugin for Expressive JSX
 *
 * @example
 * ```js
 * // next.config.js
 * const withExpressive = require('@expressive/nextjs-plugin-style');
 *
 * module.exports = withExpressive({
 *   // rest of your config
 * });
 * ```
 */
function withExpressive(expressiveOptions: ExpressiveNextPluginOptions = {}) {
  return <T extends NextConfig>(nextConfig: T = {} as T): T => {
    const experimental = nextConfig.experimental || {};
    const usingTurbopack =
      experimental.turbo ||
      experimental.turbopack ||
      process.env.TURBOPACK === "1";

    if (usingTurbopack) {
      console.warn(
        "\n⚠️  Expressive JSX does not yet support Turbopack.\n" +
          "   Turbopack is experimental and its plugin API is still unstable.\n" +
          "   Please disable Turbopack to use Expressive JSX:\n" +
          "   - Remove 'experimental.turbo' from next.config.js\n" +
          "   - Or use: next dev (without --turbo flag)\n"
      );

      return nextConfig;
    }

    return {
      ...nextConfig,

      webpack: (config: any, options: any) => {
        config.plugins.push(new ExpressiveJSXPlugin(expressiveOptions));

        if (typeof nextConfig.webpack === "function") {
          return nextConfig.webpack(config, options);
        }

        return config;
      },
    } as T;
  };
}

// Support both named and default exports
export { withExpressive };
export default withExpressive;
