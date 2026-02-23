import type { ReactNode } from 'react';

type RootLayoutProps = { children: ReactNode };

export default async function RootLayout({ children }: RootLayoutProps) {
  return <main>{children}</main>;
}

export const getConfig = async () => ({
  render: 'static',
});
