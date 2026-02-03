import Style from '@expressive/nextjs-plugin';
import Nextra from 'nextra';

const withStyle = Style();
const withNextra = Nextra({
  contentDirBasePath: '/docs'
});

export default withStyle(
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

