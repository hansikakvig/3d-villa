"use client";

import { Leva } from "leva";
import { useEffect, useState } from "react";

/**
 * Leva tweak panel. Visible in `npm run dev`, or in production with `?debug`.
 * Use `useControls` from "leva" anywhere; values work even while hidden.
 */
export default function DevPanel() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    setShow(process.env.NODE_ENV === "development" || new URLSearchParams(window.location.search).has("debug"));
  }, []);
  return <Leva hidden={!show} collapsed titleBar={{ title: "Touchwood 3D" }} />;
}
