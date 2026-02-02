import Logo from "./logo.svg";

export const SiteLogo = () => {
  fontWeight: bold;
  fontFamily: "Rubik";
  whiteSpace: nowrap;
  alignItems: center;
  display: flex;
  gap: px(10);

  Logo: {
    height: px(30);
    color: 0x8150ce;
  }

  return (
    <div>
      <Logo />
      <text>Expressive JSX</text>
    </div>
  );
};
