"use client";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"        /* Mockup 1 default */
      enableSystem={false}       /* User toggles explicitly — no OS override */
      disableTransitionOnChange={false}
      themes={["dark", "light"]}
    >
      {children}
    </NextThemesProvider>
  );
}
