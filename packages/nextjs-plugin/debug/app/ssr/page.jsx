// Server Component (default in App Router) - rendered on every request
export default async function SSRPage() {
  color: green;
  fontSize: 24;

  const time = new Date().toLocaleTimeString();

  return (
    <div>
      <div>Server Component (SSR) - rendered at {time}</div>
      <a href="/">Back</a>
    </div>
  );
}
