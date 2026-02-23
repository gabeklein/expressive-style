// This plugin is a wrapper around the ExpressiveJSXPlugin to make it easy to use with Next.js.
// For testing we can bypass it and pull from source directly.

import ExpressiveJSXPlugin from "@expressive/webpack-plugin/src";
import { NextConfig } from 'next';

export default <NextConfig>{
  webpack(config) {
    config.plugins.push(new ExpressiveJSXPlugin({}));
    return config;
  }
}
