import type { Metadata } from "next";
import "nextra-theme-docs/style.css";

export const metadata: Metadata = {
  title: "Expressive JSX",
  description: "Build-time CSS-in-JS using upcycled JavaScript syntax",
};

const Root: React.FC<React.PropsWithChildren> = ({ children }) => (
  <html lang="en" suppressHydrationWarning>
    <head>
      <link href="https://fonts.googleapis.com" rel="preconnect" />
      <link href="https://fonts.gstatic.com" rel="preconnect" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Rubik&display=swap"
        rel="stylesheet"
      />
    </head>
    <body>{children}</body>
  </html>
);

export default Root;