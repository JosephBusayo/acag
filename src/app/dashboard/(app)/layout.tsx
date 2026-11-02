import { LayoutGrid, Package, Receipt, Settings } from "lucide-react";
import Link from "next/link";
import { requireSellerShop } from "@/server/seller-session";
import { signOut } from "../actions";

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutGrid },
  { href: "/dashboard/products", label: "Products", icon: Package },
  { href: "/dashboard/orders", label: "Orders", icon: Receipt },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const shop = await requireSellerShop();
  return (
    <div className="min-h-dvh pb-20 md:flex md:pb-0">
      <aside className="hidden w-56 shrink-0 flex-col gap-1 bg-surface p-3 md:flex">
        <p className="px-3 py-2 font-display text-lg">{shop.name}</p>
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-2 rounded-chip px-3 py-2 text-sm hover:bg-surface-sunken"
          >
            <Icon className="size-4" strokeWidth={1.5} aria-hidden />
            {label}
          </Link>
        ))}
        <form action={signOut} className="mt-auto">
          <button className="px-3 py-2 text-sm text-ink-2 hover:text-ink">Exit demo</button>
        </form>
      </aside>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 md:px-10 md:py-10">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 grid grid-cols-4 border-t border-line bg-bg pb-[env(safe-area-inset-bottom)] md:hidden">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className="flex flex-col items-center gap-1 py-2 text-xs">
            <Icon className="size-5" strokeWidth={1.5} aria-hidden />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
