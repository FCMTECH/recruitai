
"use client";

import { SessionProvider as NextSessionProvider } from "next-auth/react";
import { useState, useEffect } from "react";

export function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return <NextSessionProvider>{children}</NextSessionProvider>;
}
