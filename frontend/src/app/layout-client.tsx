"use client";

import { ReactNode } from "react";
import { SidebarProvider } from "./sidebar-context";

export default function LayoutClient({ children }: { children: ReactNode }) {
  return <SidebarProvider>{children}</SidebarProvider>;
}
