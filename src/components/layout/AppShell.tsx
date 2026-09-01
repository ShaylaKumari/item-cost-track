import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { useCurrentUser } from "@/hooks/use-custeia";

const NAV_ITEMS = [
  { to: "/", label: "Visão geral" },
  { to: "/produtos", label: "Produtos" },
  { to: "/insumos", label: "Insumos" },
  { to: "/vendas", label: "Vendas" },
  { to: "/despesas", label: "Despesas" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const user = useCurrentUser();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-baseline justify-between gap-4 px-4 pt-4 sm:px-6">
          <Link to="/" className="text-[15px] font-semibold tracking-tight">
            Custeia
          </Link>
          <span className="truncate text-xs text-muted-foreground">
            {user.data?.name ?? ""}
          </span>
        </div>

        <nav aria-label="Seções" className="mx-auto max-w-5xl px-4 sm:px-6">
          <ul className="-mb-px flex gap-1 overflow-x-auto">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  activeOptions={{ exact: item.to === "/" }}
                  className="inline-block whitespace-nowrap border-b-2 border-transparent px-3 py-3 text-sm text-muted-foreground transition-colors hover:text-foreground data-[status=active]:border-primary data-[status=active]:font-medium data-[status=active]:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
