import Link from "next/link";

import { Container } from "@/components/Container";
import { ProductCard } from "@/components/ProductCard";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const topCategories = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { sortOrder: "asc" },
    take: 8,
  });

  const featured = await prisma.product.findMany({
    where: {
      isActive: true,
      tags: { some: { tag: { slug: "popular" } } },
    },
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      tags: { include: { tag: true } },
      inventory: true,
    },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  const newArrivals = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      tags: { include: { tag: true } },
      inventory: true,
    },
    orderBy: { createdAt: "desc" },
    take: 12,
  });

  return (
    <div className="pb-12">
      <section className="relative">
        <Container className="py-10 sm:py-14">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div className="grid gap-4">
              <div
                className="inline-flex w-fit items-center rounded-full border border-[color:var(--tt-border)] bg-white/60 px-3 py-1 text-xs text-[color:var(--tt-brown)]"
                style={{ boxShadow: "var(--tt-shadow)" }}
              >
                Cozy curated thrift selection
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[color:var(--tt-brown)]">
                每件物品，都值得再次被珍惜
              </h1>
              <p className="text-[color:var(--tt-brown)]/80 leading-7">
                不是便宜的二手，而是「有故事的選物」。用溫柔的方式，找到最適合你生活的那件。
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/search"
                  className="h-12 px-5 rounded-2xl bg-[color:var(--tt-accent)] text-white font-semibold grid place-items-center"
                >
                  立即逛逛
                </Link>
                <Link
                  href="/new"
                  className="h-12 px-5 rounded-2xl border border-[color:var(--tt-border)] bg-white/70 text-[color:var(--tt-brown)] font-semibold grid place-items-center hover:bg-white"
                >
                  新上架
                </Link>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-3 text-xs text-[color:var(--tt-brown)]/80">
                <div className="rounded-2xl bg-white/60 border border-[color:var(--tt-border)] p-3">
                  ♻️ 環保再利用
                </div>
                <div className="rounded-2xl bg-white/60 border border-[color:var(--tt-border)] p-3">
                  ❤️ 親自挑選整理
                </div>
                <div className="rounded-2xl bg-white/60 border border-[color:var(--tt-border)] p-3">
                  🏠 像媽媽的店
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[28px] border border-[color:var(--tt-border)] bg-[color:var(--tt-muted)] shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/demo/mug.svg"
                alt="主視覺圖片"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/0 via-black/0 to-black/5" />
            </div>
          </div>
        </Container>
      </section>

      <section className="mt-4">
        <Container>
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-lg font-semibold text-[color:var(--tt-brown)]">快速分類</h2>
            <Link href="/categories" className="text-sm text-[color:var(--tt-green)] hover:underline">
              全部分類
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {topCategories.map((c) => (
              <Link
                key={c.id}
                href={`/c/${c.slug}`}
                className="rounded-3xl border border-[color:var(--tt-border)] bg-white/70 hover:bg-white p-4 shadow-sm transition"
              >
                <div className="text-sm font-semibold text-[color:var(--tt-brown)]">{c.name}</div>
                <div className="mt-2 text-xs text-[color:var(--tt-brown)]/70">去尋寶 →</div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="mt-10">
        <Container>
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-lg font-semibold text-[color:var(--tt-brown)]">精選商品</h2>
            <div className="text-sm text-[color:var(--tt-brown)]/70">
              熱門與推薦
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {featured.map((p) => (
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
      </section>

      <section className="mt-10">
        <Container>
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-lg font-semibold text-[color:var(--tt-brown)]">新上架</h2>
            <div className="text-sm text-[color:var(--tt-brown)]/70">
              剛到貨，別錯過
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {newArrivals.map((p) => (
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
      </section>

      <section className="mt-12">
        <Container>
          <div className="rounded-[28px] border border-[color:var(--tt-border)] bg-[color:var(--tt-muted)] p-6 sm:p-10 grid gap-3">
            <div className="font-semibold text-[color:var(--tt-brown)]">品牌故事</div>
            <div className="text-[color:var(--tt-brown)]/85 leading-7">
              這是一間由媽媽經營的二手選物店。每件物品都會被仔細挑選、整理與清潔，希望它能找到新的家。
              <br />
              你逛的不只是商品，而是一段段生活的延續。
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-sm">
              <span className="rounded-full bg-white/70 border border-[color:var(--tt-border)] px-3 py-1 text-[color:var(--tt-brown)]">
                付款：銀行轉帳／到店現金
              </span>
              <span className="rounded-full bg-white/70 border border-[color:var(--tt-border)] px-3 py-1 text-[color:var(--tt-brown)]">
                店取友善
              </span>
              <span className="rounded-full bg-white/70 border border-[color:var(--tt-border)] px-3 py-1 text-[color:var(--tt-brown)]">
                生活感拍攝
              </span>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
