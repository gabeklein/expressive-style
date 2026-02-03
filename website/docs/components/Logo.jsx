import Logo from "./logo.svg";

export const SiteLogo = () => {
  fontWeight: bold;
  fontFamily: "Rubik";
  whiteSpace: nowrap;
  alignItems: center;
  display: flex;
  gap: 10;

  Logo: {
    height: 30;
    color: 0x8150ce;
  }

  return (
    <div>
      <Logo />
      <span>Expressive JSX</span>
    </div>
  );
};
