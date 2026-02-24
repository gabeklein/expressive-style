"use client";

import { useState, useEffect } from "react";

function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return <span>Uptime: {seconds}s</span>;
}

export default function Home() {
  color: green;
  fontSize: 24;

  return (
    <div>
      <div>Client Component - Expressive JSX is working!</div>
      <Timer />
      <nav>
        <a href="/ssr">SSR Page</a>
        {" | "}
        <a href="/ssg">SSG Page</a>
      </nav>
    </div>
  );
}
