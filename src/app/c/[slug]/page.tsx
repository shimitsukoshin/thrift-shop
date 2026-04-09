import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/Container";
import { ProductCard } from "@/components/ProductCard";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({
    where: { slug },
    include: { parent: true, children: { orderBy: { sortOrder: "asc" } } },
  });
  if (!category) return notFound();

  const childIds = category.children.map((c) => c.id);
  const categoryIds = [category.id, ...childIds];

  const products = await prisma.product.findMany({
    where: { isActive: true, categoryId: { in: categoryIds } },
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
      <div className="flex items-center gap-2 text-sm text-[color:var(--tt-brown)]/70">
        <Link href="/" className="hover:underline">
          首頁
        </Link>
        <span>/</span>
        {category.parent ? (
          <>
            <Link href={`/c/${category.parent.slug}`} className="hover:underline">
              {category.parent.name}
            </Link>
            <span>/</span>
          </>
        ) : null}
        <span className="text-[color:var(--tt-brown)]">{category.name}</span>
      </div>

      <div className="mt-3 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[color:var(--tt-brown)]">{category.name}</h1>
          <div className="mt-1 text-sm text-[color:var(--tt-brown)]/70">
            共 {products.length} 件商品
          </div>
        </div>
        {category.children.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {category.children.map((c) => (
              <Link
                key={c.id}
                href={`/c/${c.slug}`}
                className="rounded-full border border-[color:var(--tt-border)] bg-white/70 px-3 py-1 text-sm text-[color:var(--tt-brown)] hover:bg-white"
              >
                {c.name}
              </Link>
            ))}
          </div>
        )}
      </div>

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

