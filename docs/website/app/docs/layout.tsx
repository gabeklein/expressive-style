import { Layout, Navbar, Footer } from "nextra-theme-docs";
import { getPageMap } from "nextra/page-map";
import { SiteLogo } from "@/components/Logo";

const DocsLayout: React.FC<React.PropsWithChildren> = async ({ children }) => {
  const pageMap = await getPageMap();

  return (
    <Layout
      pageMap={pageMap}
      sidebar={{ defaultMenuCollapseLevel: 2 }}
      navbar={
        <Navbar
          logo={<SiteLogo />}
          projectLink="https://github.com/gabeklein/expressive-jsx"
        />
      }
      footer={
        <Footer>
          <p>MIT 2026 © Gabe Klein</p>
        </Footer>
      }
    >
      {children}
    </Layout>
  );
};

export default DocsLayout;
