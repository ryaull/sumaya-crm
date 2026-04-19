"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

const links = [
  { label: "Overview", href: "/dashboard" },
  { label: "Orders", href: "/dashboard/orders" },
  { label: "Customers", href: "/dashboard/customers" },
  { label: "Messages", href: "/dashboard/messages" },
  { label: "Products", href: "/dashboard/products" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    document.cookie = "gunsaar_admin=; max-age=0; path=/; samesite=lax";
    router.push("/login");
  };

  return (
    <aside className="card-dark h-full min-h-screen px-4 py-6 lg:sticky lg:top-0 lg:w-72">
      <div className="flex items-center gap-3 px-2">
        <div className="relative h-12 w-12 overflow-hidden rounded-2xl border border-white/10">
          <img src="/logo.png" alt="GUNSAAR logo" className="h-full w-full object-cover" />
        </div>
        <div>
          <p className="font-display text-xl tracking-[0.08em]">GUNSAAR</p>
          <p className="text-xs uppercase tracking-[0.2em] text-[#d8c2a2]">Admin Panel</p>
        </div>
      </div>

      <nav className="mt-8 grid gap-2">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
                active ? "bg-white text-[#3a2210]" : "text-[#f3e4cf] hover:bg-white/10"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm text-[#e4d0b0]">
        Orders, customers, and messages are managed directly through Firebase-protected collections.
      </div>

      <button type="button" className="btn-secondary mt-8 w-full" onClick={handleLogout}>
        Sign Out
      </button>
    </aside>
  );
}
