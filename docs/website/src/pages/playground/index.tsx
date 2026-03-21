"use client";

import { lazy, Suspense, useEffect, useState } from "react";

const Repl = lazy(() => import("@docs/repl"));

export default function Playground() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted)
    return <div className="h-screen w-screen" />;

  return (
    <Suspense fallback={<div className="h-screen w-screen" />}>
      <div className="h-screen w-screen">
        <Repl />
      </div>
    </Suspense>
  );
}
