import Link from "next/link";

import { Container } from "@/components/Container";
import { ProductCard } from "@/components/ProductCard";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const user = await requireUser("/account/wishlist");

  const items = await prisma.wishlistItem.findMany({
    where: { userId: user.id },
    include: {
      product: {
        include: {
          images: { orderBy: { sortOrder: "asc" }, take: 1 },
          tags: { include: { tag: true } },
          inventory: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <Container className="py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[color:var(--tt-brown)]">收藏清單</h1>
          <div className="mt-1 text-sm text-[color:var(--tt-brown)]/70">共 {items.length} 件</div>
        </div>
        <Link href="/account" className="text-sm text-[color:var(--tt-green)] hover:underline">
          回我的帳戶 →
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="mt-6 rounded-[28px] border border-[color:var(--tt-border)] bg-white/70 p-6 text-[color:var(--tt-brown)]">
          目前沒有收藏商品。
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((w) => (
            <ProductCard
              key={w.productId}
              product={{
                id: w.product.id,
                slug: w.product.slug,
                name: w.product.name,
                priceCents: w.product.priceCents,
                condition: w.product.condition,
                imageUrl: w.product.images[0]?.url ?? null,
                tagLabels: w.product.tags.map((t) => t.tag.name),
                soldOut: (w.product.inventory?.quantity ?? 0) <= 0,
              }}
            />
          ))}
        </div>
      )}
    </Container>
  );
}

