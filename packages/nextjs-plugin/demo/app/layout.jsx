export const metadata = {
  title: 'Expressive nextjs-plugin bench',
};

/**
 * @param {React.PropsWithChildren} props
 */
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
