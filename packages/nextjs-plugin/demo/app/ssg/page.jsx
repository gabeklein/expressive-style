// Static page - pre-rendered at build time
export const dynamic = "force-static";

export default function SSGPage() {
  color: blue;
  fontSize: 30;

  return (
    <div>
      <div>Static Page (SSG) - built at {new Date().toLocaleTimeString()}</div>
      <a href="/">Back</a>
    </div>
  );
}
