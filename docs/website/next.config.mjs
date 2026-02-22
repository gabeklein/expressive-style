import Expressive from '@expressive/nextjs-plugin';
import Nextra from 'nextra';

const withExpressive = Expressive();
const withNextra = Nextra({
  contentDirBasePath: '/docs'
});

export default withExpressive(
  withNextra({
    webpack: (config) => {
      config.module.rules.push({
        test: /\.svg$/i,
        issuer: /\.[jt]sx?$|\.mdx$/,
        use: ['@svgr/webpack'],
      });
      return config;
    }
  })
);

