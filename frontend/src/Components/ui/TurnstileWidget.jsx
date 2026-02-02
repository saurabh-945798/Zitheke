import React, { useEffect, useRef } from "react";

const SCRIPT_ID = "cf-turnstile-script";

const ensureScript = () =>
  new Promise((resolve, reject) => {
    if (document.getElementById(SCRIPT_ID)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Turnstile"));
    document.body.appendChild(script);
  });

const TurnstileWidget = ({ siteKey, onVerify }) => {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);

  useEffect(() => {
    if (!siteKey || !containerRef.current) return;
    let cancelled = false;

    ensureScript()
      .then(() => {
        if (cancelled || !window.turnstile) return;
        if (widgetIdRef.current) {
          window.turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        }
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token) => onVerify?.(token || ""),
          "expired-callback": () => onVerify?.(""),
          "error-callback": () => onVerify?.(""),
        });
      })
      .catch(() => {
        onVerify?.("");
      });

    return () => {
      cancelled = true;
      if (window.turnstile && widgetIdRef.current) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, onVerify]);

  if (!siteKey) return null;

  return <div ref={containerRef} />;
};

export default TurnstileWidget;
