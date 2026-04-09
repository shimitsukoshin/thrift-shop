import Link from "next/link";

import { Container } from "@/components/Container";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { clearCart, updateCartItem } from "@/app/actions/cart";

function formatTWD(priceCents: number) {
  const n = Math.round(priceCents / 100);
  return `NT$ ${n.toLocaleString("zh-Hant-TW")}`;
}

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const user = await requireUser("/cart");

  const items = await prisma.cartItem.findMany({
    where: { userId: user.id },
    include: {
      product: {
        include: { images: { orderBy: { sortOrder: "asc" }, take: 1 }, inventory: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const lines = items
    .filter((it) => it.product.isActive)
    .map((it) => {
      const available = it.product.inventory?.quantity ?? 0;
      const qty = Math.min(it.quantity, Math.max(0, available));
      const lineTotal = it.product.priceCents * qty;
      return { it, available, qty, lineTotal };
    });

  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const shipping = 0; // default: store pickup; shipping fee handled in checkout if needed
  const total = subtotal + shipping;

  return (
    <Container className="py-10">
      <h1 className="text-2xl font-bold text-[color:var(--tt-brown)]">購物車</h1>

      {lines.length === 0 ? (
        <div className="mt-6 rounded-[28px] border border-[color:var(--tt-border)] bg-white/70 p-6">
          <div className="text-[color:var(--tt-brown)]">你的購物車是空的。</div>
          <Link href="/" className="mt-3 inline-block text-sm text-[color:var(--tt-green)] hover:underline">
            回首頁逛逛 →
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="grid gap-3">
            {lines.map(({ it, available, qty, lineTotal }) => (
              <div
                key={it.productId}
                className="rounded-[28px] border border-[color:var(--tt-border)] bg-white/70 p-4 flex gap-4"
              >
                <div className="h-24 w-24 overflow-hidden rounded-2xl border border-[color:var(--tt-border)] bg-[color:var(--tt-muted)] shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={it.product.images[0]?.url ?? "/demo/mug.svg"}
                    alt={it.product.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/p/${it.product.slug}`} className="font-semibold text-[color:var(--tt-brown)] hover:underline">
                    {it.product.name}
                  </Link>
                  <div className="mt-1 text-sm text-[color:var(--tt-brown)]/75">
                    {formatTWD(it.product.priceCents)} · {it.product.condition === "NEW" ? "全新" : "二手"}
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <form action={updateCartItem} className="flex items-center gap-2">
                      <input type="hidden" name="productId" value={it.productId} />
                      <label className="text-xs text-[color:var(--tt-brown)]/70" htmlFor={`qty-${it.productId}`}>
                        數量
                      </label>
                      <input
                        id={`qty-${it.productId}`}
                        name="qty"
                        type="number"
                        min={0}
                        max={Math.max(0, available)}
                        defaultValue={qty}
                        className="h-10 w-24 rounded-2xl border border-[color:var(--tt-border)] bg-white px-3 text-sm text-[color:var(--tt-brown)]"
                      />
                      <button
                        type="submit"
                        className="h-10 px-3 rounded-2xl border border-[color:var(--tt-border)] bg-white hover:bg-[color:var(--tt-muted)] text-sm text-[color:var(--tt-brown)]"
                      >
                        更新
                      </button>
                    </form>
                    <div className="text-sm font-semibold text-[color:var(--tt-brown)]">{formatTWD(lineTotal)}</div>
                  </div>
                  {available <= 0 ? (
                    <div className="mt-2 text-xs text-red-700">此商品已售完，請將數量改為 0 移除。</div>
                  ) : null}
                </div>
              </div>
            ))}

            <form action={clearCart}>
              <button
                type="submit"
                className="w-fit h-10 px-3 rounded-2xl border border-[color:var(--tt-border)] bg-white/70 hover:bg-white text-sm text-[color:var(--tt-brown)]"
              >
                清空購物車
              </button>
            </form>
          </div>

          <div className="rounded-[28px] border border-[color:var(--tt-border)] bg-white/70 p-5 h-fit">
            <div className="font-semibold text-[color:var(--tt-brown)]">結帳金額</div>
            <div className="mt-4 grid gap-2 text-sm text-[color:var(--tt-brown)]/85">
              <div className="flex justify-between">
                <span>小計</span>
                <span>{formatTWD(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>運費</span>
                <span>{formatTWD(shipping)}</span>
              </div>
              <div className="mt-2 pt-3 border-t border-[color:var(--tt-border)] flex justify-between text-base font-semibold text-[color:var(--tt-brown)]">
                <span>合計</span>
                <span>{formatTWD(total)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="mt-5 h-12 rounded-2xl bg-[color:var(--tt-accent)] text-white font-semibold grid place-items-center"
            >
              前往結帳
            </Link>
            <div className="mt-3 text-xs text-[color:var(--tt-brown)]/70">
              付款方式：銀行轉帳／到店現金（下單後由店家確認）
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}

