export const metadata = {
  title: 'Expressive nextjs-plugin bench',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
