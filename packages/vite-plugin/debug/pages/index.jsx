import { Counter } from '../components/counter';
import { FooBar } from '../components/foobar';

export default function HomePage() {
  font: "sans-serif";
  outline: red;
  padding: 12;
  radius: 10;

  h1: {
    color: 0x333;
    marginBottom: 12;
    fontSize: "1.5rem";
  }

  Counter: {
    marginTop: 20;
  }

  return (
    <div>
      <title>Expressive Vite Plugin Test</title>
      <h1>Hello Waku</h1>
      <FooBar />
      <Counter />
    </div>
  );
}

export const getConfig = async () => ({
  render: 'static',
});
