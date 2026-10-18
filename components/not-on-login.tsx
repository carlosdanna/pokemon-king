"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** The header's links and search lead nowhere before login (D-043). */
export function NotOnLogin({ children }: { children: ReactNode }) {
  return usePathname() === "/login" ? null : children;
}
