import type { PropsWithChildren } from 'react';
import { baseOptions } from '@/lib/options';
import { HomeLayout } from 'fumadocs-ui/layouts/home';

export default function Layout({ children }: PropsWithChildren) {
  return <HomeLayout {...baseOptions()}>{children}</HomeLayout>;
}
