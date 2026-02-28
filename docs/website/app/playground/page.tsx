"use client";

import { lazy, Suspense, useEffect, useState } from "react";
import { Window } from "./Window";

const Repl = lazy(() => import("@docs/repl"));

export default function Playground() {
  const [mounted, setMounted] = useState(false);
  const fallback = <div className="h-screen w-screen" />;

  useEffect(() => setMounted(true), []);

  if (!mounted) return fallback;

  return (
    <Suspense fallback={fallback}>
      <Window>
        <Repl />
      </Window>
    </Suspense>
  );
}
