"use client";

import { useEffect, useState } from "react";

/**
 * A utility component that ensures its children are only rendered on the client side.
 * This is used to prevent React hydration errors by avoiding mismatches between
 * server-rendered and client-rendered content, especially for components that
 * rely on browser-specific APIs or state (like theme, auth state, etc.).
 */
export default function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <>{children}</>;
}
