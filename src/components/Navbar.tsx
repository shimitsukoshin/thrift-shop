import Link from "next/link";
import { Search, ShoppingBag, User } from "lucide-react";

import { Container } from "@/components/Container";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function Navbar() {
  const session = await getSession();
  const topCategories = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { sortOrder: "asc" },
    take: 8,
  });

  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--tt-border)] bg-[color:var(--tt-bg)]/90 backdrop-blur">
      <Container className="h-16 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="h-9 w-9 rounded-2xl bg-[color:var(--tt-muted)] shadow-sm grid place-items-center">
            <span className="text-[color:var(--tt-brown)] font-bold">愛</span>
          </div>
          <div className="leading-tight">
            <div className="font-semibold text-[color:var(--tt-brown)]">愛地球二手好物</div>
            <div className="text-xs text-[color:var(--tt-brown)]/70">溫暖 × 實用 × 尋寶</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-4 ml-6 text-sm text-[color:var(--tt-brown)]/90">
          {topCategories.map((c) => (
            <Link key={c.id} href={`/c/${c.slug}`} className="hover:text-[color:var(--tt-brown)]">
              {c.name}
            </Link>
          ))}
          <Link href="/new" className="hover:text-[color:var(--tt-brown)]">
            新上架
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/search"
            className="h-10 px-3 rounded-2xl border border-[color:var(--tt-border)] bg-white/70 hover:bg-white flex items-center gap-2 text-sm text-[color:var(--tt-brown)]"
          >
            <Search size={18} />
            <span className="hidden sm:inline">搜尋</span>
          </Link>

          <Link
            href="/cart"
            className="h-10 w-10 rounded-2xl border border-[color:var(--tt-border)] bg-white/70 hover:bg-white grid place-items-center text-[color:var(--tt-brown)]"
            aria-label="購物車"
          >
            <ShoppingBag size={18} />
          </Link>

          {session.user ? (
            <Link
              href="/account"
              className="h-10 px-3 rounded-2xl bg-[color:var(--tt-brown)] text-[color:var(--tt-bg)] hover:opacity-95 flex items-center gap-2 text-sm"
            >
              <User size={18} />
              <span className="hidden sm:inline">{session.user.name ?? "我的帳戶"}</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="h-10 px-3 rounded-2xl bg-[color:var(--tt-brown)] text-[color:var(--tt-bg)] hover:opacity-95 flex items-center gap-2 text-sm"
            >
              <User size={18} />
              <span className="hidden sm:inline">登入</span>
            </Link>
          )}
        </div>
      </Container>
    </header>
  );
}

