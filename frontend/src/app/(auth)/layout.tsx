import type { ReactNode } from "react";

import { AuthLayoutContainer } from "@/containers/AuthLayoutContainer";

export default function Layout({ children }: { children: ReactNode }) {
  return <AuthLayoutContainer>{children}</AuthLayoutContainer>;
}
