import type { ReactNode } from "react";

// samo raspored: svaka auth stranica (dizajn/login strana, dizajn/registar strana) nosi svoj pun izgled
export function AuthLayout({ children }: { children: ReactNode }) {
  return <div className="flex flex-1 flex-col">{children}</div>;
}
