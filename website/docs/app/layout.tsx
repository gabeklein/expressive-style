import type { Metadata } from 'next';
import { Layout, Navbar, Footer } from 'nextra-theme-docs';
import { getPageMap } from 'nextra/page-map';
import { SiteLogo } from '@/components/Logo';
import 'nextra-theme-docs/style.css';

export const metadata: Metadata = {
  title: 'Expressive JSX',
  description: 'Build-time CSS-in-JS using upcycled JavaScript syntax',
};

export default async function RootLayout(props: React.PropsWithChildren) {
  const pageMap = await getPageMap();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link href="https://fonts.gstatic.com" rel="preconnect" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Rubik&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Layout
          pageMap={pageMap}
          navbar={
            <Navbar
              logo={<SiteLogo />}
              projectLink="https://github.com/gabeklein/expressive-jsx"
            />
          }
          footer={
            <Footer>
              <p>MIT 2024 © Gabe Klein</p>
            </Footer>
          }
          sidebar={{ defaultMenuCollapseLevel: 2 }}
        >
          {props.children}
        </Layout>
      </body>
    </html>
  );
}
