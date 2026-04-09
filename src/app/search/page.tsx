import Link from "next/link";

import { Container } from "@/components/Container";
import { ProductCard } from "@/components/ProductCard";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    condition?: "NEW" | "USED";
    category?: string;
    min?: string;
    max?: string;
  }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const condition = sp.condition;
  const category = (sp.category ?? "").trim();
  const min = sp.min ? Number(sp.min) : undefined;
  const max = sp.max ? Number(sp.max) : undefined;

  const categories = await prisma.category.findMany({
    orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }],
  });

  const where: Prisma.ProductWhereInput = { isActive: true };
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { description: { contains: q } },
      { wearNotes: { contains: q } },
    ];
  }
  if (condition === "NEW" || condition === "USED") where.condition = condition;
  if (category) {
    const cat = await prisma.category.findUnique({ where: { slug: category } });
    if (cat) where.categoryId = cat.id;
  }
  const priceFilter: Prisma.IntFilter = {};
  if (typeof min === "number" && !Number.isNaN(min)) priceFilter.gte = Math.round(min * 100);
  if (typeof max === "number" && !Number.isNaN(max)) priceFilter.lte = Math.round(max * 100);
  if (typeof priceFilter.gte === "number" || typeof priceFilter.lte === "number") {
    where.priceCents = priceFilter;
  }

  const products = await prisma.product.findMany({
    where,
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      tags: { include: { tag: true } },
      inventory: true,
    },
    orderBy: { createdAt: "desc" },
    take: 48,
  });

  return (
    <Container className="py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[color:var(--tt-brown)]">搜尋</h1>
          <div className="mt-1 text-sm text-[color:var(--tt-brown)]/70">共 {products.length} 件</div>
        </div>
        <Link href="/categories" className="text-sm text-[color:var(--tt-green)] hover:underline">
          分類瀏覽 →
        </Link>
      </div>

      <form className="mt-6 rounded-[28px] border border-[color:var(--tt-border)] bg-white/70 p-5 grid gap-3 md:grid-cols-6">
        <input
          name="q"
          defaultValue={q}
          placeholder="關鍵字（名稱/描述）"
          className="h-12 rounded-2xl border border-[color:var(--tt-border)] bg-white px-4 text-[color:var(--tt-brown)] md:col-span-2"
        />
        <select
          name="category"
          defaultValue={category}
          className="h-12 rounded-2xl border border-[color:var(--tt-border)] bg-white px-4 text-[color:var(--tt-brown)]"
        >
          <option value="">全部分類</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.parentId ? `└ ${c.name}` : c.name}
            </option>
          ))}
        </select>
        <select
          name="condition"
          defaultValue={condition ?? ""}
          className="h-12 rounded-2xl border border-[color:var(--tt-border)] bg-white px-4 text-[color:var(--tt-brown)]"
        >
          <option value="">全新/二手</option>
          <option value="NEW">全新</option>
          <option value="USED">二手</option>
        </select>
        <input
          name="min"
          inputMode="numeric"
          placeholder="最低價（NT$）"
          defaultValue={sp.min ?? ""}
          className="h-12 rounded-2xl border border-[color:var(--tt-border)] bg-white px-4 text-[color:var(--tt-brown)]"
        />
        <input
          name="max"
          inputMode="numeric"
          placeholder="最高價（NT$）"
          defaultValue={sp.max ?? ""}
          className="h-12 rounded-2xl border border-[color:var(--tt-border)] bg-white px-4 text-[color:var(--tt-brown)]"
        />
        <button
          type="submit"
          className="h-12 rounded-2xl bg-[color:var(--tt-accent)] text-white font-semibold md:col-span-6"
        >
          套用篩選
        </button>
      </form>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            product={{
              id: p.id,
              slug: p.slug,
              name: p.name,
              priceCents: p.priceCents,
              condition: p.condition,
              imageUrl: p.images[0]?.url ?? null,
              tagLabels: p.tags.map((t) => t.tag.name),
              soldOut: (p.inventory?.quantity ?? 0) <= 0,
            }}
          />
        ))}
      </div>
    </Container>
  );
}

