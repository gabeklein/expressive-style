"use client";

export default function Home() {
  color: red;
  fontSize: 24;

  return (
    <div>
      <div>Client Component - Expressive JSX is working!</div>
      <nav>
        <a href="/ssr">SSR Page</a>
        {" | "}
        <a href="/ssg">SSG Page</a>
      </nav>
    </div>
  );
}
