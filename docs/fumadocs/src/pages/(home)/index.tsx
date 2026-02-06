import { Hero } from '@/components/homepage/Hero';
import { Features } from '@/components/homepage/Features';

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
    </>
  );
}

export const getConfig = async () => {
  return {
    render: 'static',
  };
};
