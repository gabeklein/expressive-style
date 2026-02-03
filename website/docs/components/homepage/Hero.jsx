import Link from 'next/link';

export const Hero = () => {
  textAlign: center;
  padding: 80, 20;
  maxWidth: 1200;
  margin: 0, auto;

  // if ('.dark') {
  //   background: 0x0a0a0a;
  // }

  headline: {
    fontSize: 3.5;
    fontWeight: bold;
    lineHeight: 1.2;
    marginBottom: 20;
    background: 'linear-gradient(135deg, #8150ce 0%, #e74694 100%)';
    WebkitBackgroundClip: text;
    WebkitTextFillColor: transparent;
    backgroundClip: text;
  }

  subtitle: {
    fontSize: 1.25;
    color: 0x666;
    marginBottom: 40;
    lineHeight: 1.6;
  }

  // if ('.dark') {
  //   if ('subtitle') {
  //     color: 0x999;
  //   }
  // }

  cta: {
    display: inlineFlex;
    gap: 15;
    flexWrap: wrap;
    justifyContent: center;
  }

  button: {
    padding: 12, 30;
    fontSize: 1.1;
    fontWeight: 600;
    borderRadius: 8;
    textDecoration: none;
    transition: 'all 0.2s ease';
    cursor: pointer;
  }

  primary: {
    background: 0x8150ce;
    color: white;
    border: none;
  }

  // if (':hover') {
  //   if ('primary') {
  //     transform: 'translateY(-2px)';
  //     boxShadow: '0 4px 12px rgba(129, 80, 206, 0.3)';
  //   }
  // }

  secondary: {
    background: transparent;
    color: 0x8150ce;
    border: '2px solid #8150ce';
  }

  // if (':hover') {
  //   if ('secondary') {
  //     background: 0x8150ce;
  //     color: white;
  //   }
  // }

  // if ('.dark') {
  //   if ('secondary') {
  //     color: white;
  //     border: '2px solid white';
  //   }
  //   if (':hover') {
  //     if ('secondary') {
  //       background: white;
  //       color: 0x0a0a0a;
  //     }
  //   }
  // }

  return (
    <section>
      <h1 _headline>
        Upcycled JavaScript
        <br />
        Zero-Runtime CSS
      </h1>
      <p _subtitle>
        Build-time CSS-in-JS that repurposes JavaScript labels into a powerful styling system.
        <br />
        No wrapper components. No runtime overhead. Just natural syntax.
      </p>
      <div _cta>
        <Link href="/docs" _button _primary>
          Get Started
        </Link>
        <a
          href="https://github.com/gabeklein/expressive-jsx"
          target="_blank"
          rel="noopener noreferrer"
          _button
          _secondary
        >
          View on GitHub
        </a>
      </div>
    </section>
  );
};
