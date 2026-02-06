import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { SiteLogo } from '@/components/Logo';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: <SiteLogo />,
    },
    links: [
      {
        text: 'Documentation',
        url: '/docs',
      },
    ],
    githubUrl: 'https://github.com/gabeklein/expressive-jsx',
  };
}
