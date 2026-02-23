'use client';

import { useState } from 'react';

export const Counter = () => {
  const [count, setCount] = useState(0);

  button: {
    marginTop: 8;
    background: black;
    color: white;
    padding: 4, 8;
    borderRadius: 4;
    fontSize: 14;
  }

  return (
    <section>
      <div>Count: {count}</div>
      <button onClick={() => setCount((c) => c + 1)}>Increment</button>
    </section>
  );
};
