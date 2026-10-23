import type { ReactNode } from "react";

import { AppLayoutContainer } from "@/containers/AppLayoutContainer";

export default function Layout({ children }: { children: ReactNode }) {
  return <AppLayoutContainer>{children}</AppLayoutContainer>;
}
