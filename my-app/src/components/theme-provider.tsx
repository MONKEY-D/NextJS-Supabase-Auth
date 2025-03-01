// "use client"

// import * as React from "react"
// import { ThemeProvider as NextThemesProvider } from "next-themes"

// export function ThemeProvider({
//   children,
//   ...props
// }: React.ComponentProps<typeof NextThemesProvider>) {
//   return <NextThemesProvider {...props}>{children}</NextThemesProvider>
// }


"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true); // Prevents mismatch by ensuring it's only rendered after hydration
  }, []);

  if (!mounted) {
    return <>{children}</>; // Prevents rendering until after mount
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
