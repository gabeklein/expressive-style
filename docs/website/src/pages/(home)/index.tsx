import { Features } from './Features';
import { Hero } from './Hero';

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
