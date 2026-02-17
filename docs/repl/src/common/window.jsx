function Window({ children }) {
  height: "100vh";
  boxSizing: borderBox;
  padding: 0, 10;
  gridRows: min, 'minmax(0, 1fr)', min;
  overflow: hidden;

  return (
    <div>
      <Header />
      {children}
      <Footer />
    </div>
  );
}

export function Header() {
  height: 50;
  display: flex;
  alignItems: center;
  padding: 0, 20;

  img: {
    size: 30;
    marginR: 10;
    marginT: 2;
  }

  return (
    <div>
      <img src="/Logo.svg" />
      Expressive JSX Demo
    </div>
  );
}

export function Footer() {
  marginB: 5;
  margin: 15, 0, 20;
  color: $textDark;
  textAlign: center;
  fontSize: 12;

  return (
    <div>Gabe Klein - MIT - {new Date().getFullYear()}</div>
  );
}

export default Window;