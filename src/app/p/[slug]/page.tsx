import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/Container";
import { prisma } from "@/lib/prisma";
import { addToCart } from "@/app/actions/cart";

function formatTWD(priceCents: number) {
  const n = Math.round(priceCents / 100);
  return `NT$ ${n.toLocaleString("zh-Hant-TW")}`;
}

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      tags: { include: { tag: true } },
      inventory: true,
      category: { include: { parent: true } },
    },
  });
  if (!product || !product.isActive) return notFound();

  const inStock = (product.inventory?.quantity ?? 0) > 0;

  return (
    <Container className="py-10">
      <div className="flex items-center gap-2 text-sm text-[color:var(--tt-brown)]/70">
        <Link href="/" className="hover:underline">
          首頁
        </Link>
        <span>/</span>
        {product.category.parent ? (
          <>
            <Link href={`/c/${product.category.parent.slug}`} className="hover:underline">
              {product.category.parent.name}
            </Link>
            <span>/</span>
          </>
        ) : null}
        <Link href={`/c/${product.category.slug}`} className="hover:underline">
          {product.category.name}
        </Link>
      </div>

      <div className="mt-4 grid gap-8 lg:grid-cols-2">
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            {product.images.length > 0 ? (
              product.images.slice(0, 4).map((img) => (
                <div
                  key={img.id}
                  className="overflow-hidden rounded-[28px] border border-[color:var(--tt-border)] bg-[color:var(--tt-muted)]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.alt ?? product.name} className="h-full w-full object-cover" />
                </div>
              ))
            ) : (
              <div className="col-span-2 overflow-hidden rounded-[28px] border border-[color:var(--tt-border)] bg-[color:var(--tt-muted)] p-10 text-center text-[color:var(--tt-brown)]/70">
                尚無圖片
              </div>
            )}
          </div>
          {product.images.length > 4 ? (
            <div className="text-xs text-[color:var(--tt-brown)]/70">
              共有 {product.images.length} 張照片（示範頁僅顯示前 4 張）
            </div>
          ) : null}
        </div>

        <div className="grid gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-[color:var(--tt-brown)]">{product.name}</h1>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-[color:var(--tt-green)] px-3 py-1 text-sm text-white">
              {product.condition === "NEW" ? "全新" : "二手"}
            </span>
            {product.tags.map((t) => (
              <span
                key={t.tagId}
                className="rounded-full bg-[color:var(--tt-accent)] px-3 py-1 text-sm text-white"
              >
                {t.tag.name}
              </span>
            ))}
            <span
              className={`rounded-full px-3 py-1 text-sm border ${
                inStock
                  ? "border-[color:var(--tt-border)] bg-white/70 text-[color:var(--tt-brown)]"
                  : "border-transparent bg-black/10 text-[color:var(--tt-brown)]/70"
              }`}
            >
              {inStock ? `庫存 ${product.inventory?.quantity ?? 0}` : "已售完"}
            </span>
          </div>

          <div className="text-xl font-semibold text-[color:var(--tt-brown)]">{formatTWD(product.priceCents)}</div>

          <div className="rounded-[28px] border border-[color:var(--tt-border)] bg-white/70 p-5 grid gap-3">
            <div className="text-sm font-semibold text-[color:var(--tt-brown)]">商品描述</div>
            <div className="text-sm text-[color:var(--tt-brown)]/80 leading-7 whitespace-pre-wrap">
              {product.description}
            </div>
            <div className="text-sm font-semibold text-[color:var(--tt-brown)]">使用狀況 / 磨損說明</div>
            <div className="text-sm text-[color:var(--tt-brown)]/80 leading-7 whitespace-pre-wrap">
              {product.wearNotes ?? "—"}
            </div>
          </div>

          <form action={addToCart} className="grid gap-3">
            <input type="hidden" name="productId" value={product.id} />
            <input type="hidden" name="returnTo" value={`/p/${product.slug}`} />
            <div className="flex items-center gap-3">
              <label className="text-sm text-[color:var(--tt-brown)]/80" htmlFor="qty">
                數量
              </label>
              <input
                id="qty"
                name="qty"
                type="number"
                min={1}
                max={Math.max(1, product.inventory?.quantity ?? 1)}
                defaultValue={1}
                className="h-11 w-24 rounded-2xl border border-[color:var(--tt-border)] bg-white px-3 text-[color:var(--tt-brown)]"
              />
            </div>
            <button
              type="submit"
              disabled={!inStock}
              className="h-12 rounded-2xl bg-[color:var(--tt-brown)] text-[color:var(--tt-bg)] font-semibold disabled:opacity-40"
            >
              加入購物車
            </button>
            <div className="text-xs text-[color:var(--tt-brown)]/70">
              付款方式：銀行轉帳／到店現金（下單後由店家確認）
            </div>
          </form>
        </div>
      </div>
    </Container>
  );
}

