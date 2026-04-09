import Link from "next/link";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { category: true, inventory: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[color:var(--tt-brown)]">商品管理</h1>
          <div className="mt-1 text-sm text-[color:var(--tt-brown)]/70">共 {products.length} 件</div>
        </div>
        <Link
          href="/admin/products/new"
          className="h-11 px-4 rounded-2xl bg-[color:var(--tt-accent)] text-white font-semibold grid place-items-center"
        >
          新增商品
        </Link>
      </div>

      <div className="rounded-[28px] border border-[color:var(--tt-border)] bg-white/70 overflow-hidden">
        <div className="grid grid-cols-[1fr_140px_140px_120px] gap-0 text-xs font-semibold text-[color:var(--tt-brown)]/70 border-b border-[color:var(--tt-border)] px-4 py-3">
          <div>商品</div>
          <div>分類</div>
          <div>庫存</div>
          <div>狀態</div>
        </div>
        {products.map((p) => (
          <Link
            key={p.id}
            href={`/admin/products/${p.id}`}
            className="grid grid-cols-[1fr_140px_140px_120px] px-4 py-3 text-sm border-b border-[color:var(--tt-border)] hover:bg-white"
          >
            <div className="min-w-0">
              <div className="font-semibold text-[color:var(--tt-brown)] line-clamp-1">{p.name}</div>
              <div className="text-xs text-[color:var(--tt-brown)]/70 line-clamp-1">/{p.slug}</div>
            </div>
            <div className="text-[color:var(--tt-brown)]/80">{p.category.name}</div>
            <div className="text-[color:var(--tt-brown)]/80">{p.inventory?.quantity ?? 0}</div>
            <div className="text-[color:var(--tt-brown)]/80">{p.isActive ? "上架" : "下架"}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

