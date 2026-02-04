import type { NextConfig } from "next";
import ExpressiveJSXPlugin, { Options } from "@expressive/webpack-plugin";

export interface ExpressiveNextPluginOptions extends Options {
  // Additional Next.js-specific options can go here
}

/**
 * Next.js plugin for Expressive JSX
 *
 * @example
 * ```js
 * // next.config.js
 * const withExpressive = require('@expressive/nextjs-plugin');
 *
 * module.exports = withExpressive({
 *   // Next.js config
 * });
 * ```
 */
function withExpressive(expressiveOptions: ExpressiveNextPluginOptions = {}) {
  return (nextConfig: NextConfig = {}): NextConfig => {
    // Check for Turbopack usage
    const experimental = nextConfig.experimental || {};
    const usingTurbopack =
      (experimental as any).turbo ||
      (experimental as any).turbopack ||
      process.env.TURBOPACK === "1";

    if (usingTurbopack) {
      console.warn(
        "\n⚠️  Expressive JSX does not yet support Turbopack.\n" +
          "   Turbopack is experimental and its plugin API is still unstable.\n" +
          "   Please disable Turbopack to use Expressive JSX:\n" +
          "   - Remove 'experimental.turbo' from next.config.js\n" +
          "   - Or use: next dev (without --turbo flag)\n" +
          "   GitHub issue: https://github.com/gabeklein/expressive-dsl/issues/XXX\n"
      );

      // Return config unmodified to avoid breaking Next.js build
      return nextConfig;
    }

    return {
      ...nextConfig,

      webpack: (config, options) => {
        // Add Expressive JSX webpack plugin
        config.plugins.push(new ExpressiveJSXPlugin(expressiveOptions));

        // Call user's webpack config if provided
        if (typeof nextConfig.webpack === "function") {
          return nextConfig.webpack(config, options);
        }

        return config;
      },
    };
  };
}

// Support both named and default exports
export { withExpressive };
export default withExpressive;
