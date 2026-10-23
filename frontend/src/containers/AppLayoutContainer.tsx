"use client";

import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";

import { AppLayout } from "@/components/layouts/AppLayout";
import { useAuth } from "@/lib/auth";
import { getMyCompany } from "@/lib/endpoints";
import { getCompanyTypeLabel, getNavItems, isActivePath } from "@/lib/navigation";
import { readTheme, subscribeTheme, writeTheme, type Theme } from "@/lib/theme";

// zaštita ruta: bez sesije → /login; meni i labele se računaju ovde, layout dobija gotove podatke
export function AppLayoutContainer({ children }: { children: ReactNode }) {
  const { session, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const theme = useSyncExternalStore(subscribeTheme, readTheme, (): Theme => "light");

  const { data } = useQuery({
    queryKey: ["company", "me"],
    queryFn: getMyCompany,
    enabled: !!session,
  });

  useEffect(() => {
    if (session === null) router.replace("/login");
  }, [session, router]);

  if (!session) return null; // undefined (učitava se) ili null (redirect u toku)

  const navItems = getNavItems(session.type).map((item) => ({ ...item, isActive: isActivePath(pathname, item.href) }));

  return (
    <AppLayout
      companyName={data?.company.name}
      companyTypeLabel={getCompanyTypeLabel(session.type)}
      navItems={navItems}
      isMenuOpen={isMenuOpen}
      onToggleMenu={() => setIsMenuOpen((open) => !open)}
      onCloseMenu={() => setIsMenuOpen(false)}
      isDarkTheme={theme === "dark"}
      onToggleTheme={() => writeTheme(theme === "dark" ? "light" : "dark")}
      onSignOut={() => signOut()}
    >
      {children}
    </AppLayout>
  );
}
