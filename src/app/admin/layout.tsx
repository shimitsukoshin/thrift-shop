import Link from "next/link";

import { Container } from "@/components/Container";
import { requireAdmin } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin("/admin");

  return (
    <div className="bg-[color:var(--tt-bg)]">
      <Container className="py-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-lg font-semibold text-[color:var(--tt-brown)]">管理後台</div>
          <div className="flex flex-wrap gap-2 text-sm">
            <Link className="rounded-full border border-[color:var(--tt-border)] bg-white px-3 py-1 hover:bg-[color:var(--tt-muted)]" href="/admin">
              概覽
            </Link>
            <Link className="rounded-full border border-[color:var(--tt-border)] bg-white px-3 py-1 hover:bg-[color:var(--tt-muted)]" href="/admin/products">
              商品
            </Link>
            <Link className="rounded-full border border-[color:var(--tt-border)] bg-white px-3 py-1 hover:bg-[color:var(--tt-muted)]" href="/admin/categories">
              分類
            </Link>
            <Link className="rounded-full border border-[color:var(--tt-border)] bg-white px-3 py-1 hover:bg-[color:var(--tt-muted)]" href="/admin/orders">
              訂單
            </Link>
            <Link className="rounded-full border border-[color:var(--tt-border)] bg-white px-3 py-1 hover:bg-[color:var(--tt-muted)]" href="/admin/users">
              使用者
            </Link>
          </div>
        </div>
      </Container>
      <Container className="pb-12">{children}</Container>
    </div>
  );
}

