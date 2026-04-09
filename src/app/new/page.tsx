import { Container } from "@/components/Container";
import { ProductCard } from "@/components/ProductCard";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NewArrivalsPage() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      tags: { include: { tag: true } },
      inventory: true,
    },
    orderBy: { createdAt: "desc" },
    take: 60,
  });

  return (
    <Container className="py-10">
      <h1 className="text-2xl font-bold text-[color:var(--tt-brown)]">新上架</h1>
      <p className="mt-2 text-sm text-[color:var(--tt-brown)]/75">剛到貨，看到喜歡的就先收藏或下單。</p>

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

