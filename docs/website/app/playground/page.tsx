"use client";

import { Suspense } from "react";
import { Window } from "./Window";
import dynamic from "next/dynamic";

const Repl = dynamic(() => import("@docs/repl"), { ssr: false });

export default function Playground() {
  return (
    <Suspense fallback={<div className="h-screen w-screen" />}>
      <Window>
        <Repl />
      </Window>
    </Suspense>
  );
}
