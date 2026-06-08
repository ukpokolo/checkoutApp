"use client";

import { useEffect, useRef } from "react";

export function useInterswitch() {
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (scriptLoaded.current) return;

    const scriptSrc =
      process.env.NEXT_PUBLIC_INTERSWITCH_ENV === "TEST"
        ? "https://newwebpay-sandbox.interswitchng.com/inline-checkout.js"
        : "https://newwebpay.interswitchng.com/inline-checkout.js";

    const existing = document.querySelector(`script[src="${scriptSrc}"]`);
    if (existing) {
      scriptLoaded.current = true;
      return;
    }

    const script = document.createElement("script");
    script.src = scriptSrc;
    script.async = true;
    script.onload = () => {
      scriptLoaded.current = true;
    };
    script.onerror = () =>
      console.error("Failed to load Interswitch inline-checkout.js");
    document.body.appendChild(script);

    // Don't remove on unmount — other pages may still need it
  }, []);
}
