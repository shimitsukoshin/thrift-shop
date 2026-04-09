import Link from "next/link";

import { Container } from "@/components/Container";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { createOrder } from "@/app/actions/checkout";

function formatTWD(priceCents: number) {
  const n = Math.round(priceCents / 100);
  return `NT$ ${n.toLocaleString("zh-Hant-TW")}`;
}

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const user = await requireUser("/checkout");

  const items = await prisma.cartItem.findMany({
    where: { userId: user.id },
    include: { product: { include: { inventory: true } } },
  });

  const lines = items
    .filter((it) => it.product.isActive)
    .map((it) => {
      const available = it.product.inventory?.quantity ?? 0;
      const qty = Math.min(it.quantity, available);
      return { it, qty, lineTotal: it.product.priceCents * qty };
    })
    .filter((l) => l.qty > 0);

  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const shipping = 0;
  const total = subtotal + shipping;

  if (lines.length === 0) {
    return (
      <Container className="py-10">
        <h1 className="text-2xl font-bold text-[color:var(--tt-brown)]">結帳</h1>
        <div className="mt-6 rounded-[28px] border border-[color:var(--tt-border)] bg-white/70 p-6">
          <div className="text-[color:var(--tt-brown)]">你的購物車目前沒有可結帳的商品。</div>
          <Link href="/cart" className="mt-3 inline-block text-sm text-[color:var(--tt-green)] hover:underline">
            回購物車 →
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-10">
      <h1 className="text-2xl font-bold text-[color:var(--tt-brown)]">結帳</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <form action={createOrder} className="rounded-[28px] border border-[color:var(--tt-border)] bg-white/70 p-6 grid gap-6">
          <div className="grid gap-3">
            <div className="font-semibold text-[color:var(--tt-brown)]">付款方式</div>
            <label className="flex items-center gap-3 rounded-2xl border border-[color:var(--tt-border)] bg-white px-4 py-3">
              <input type="radio" name="paymentMethod" value="BANK_TRANSFER" defaultChecked />
              <div className="grid">
                <div className="font-semibold text-[color:var(--tt-brown)]">銀行轉帳</div>
                <div className="text-sm text-[color:var(--tt-brown)]/70">下單後顯示匯款資訊，店家對帳後確認付款。</div>
              </div>
            </label>
            <label className="flex items-center gap-3 rounded-2xl border border-[color:var(--tt-border)] bg-white px-4 py-3">
              <input type="radio" name="paymentMethod" value="CASH_ON_PICKUP" />
              <div className="grid">
                <div className="font-semibold text-[color:var(--tt-brown)]">到店現金</div>
                <div className="text-sm text-[color:var(--tt-brown)]/70">保留商品，到店付款取貨。</div>
              </div>
            </label>
          </div>

          <div className="grid gap-3">
            <div className="font-semibold text-[color:var(--tt-brown)]">取貨方式</div>
            <label className="flex items-center gap-3 rounded-2xl border border-[color:var(--tt-border)] bg-white px-4 py-3">
              <input type="radio" name="fulfillmentMethod" value="PICKUP" defaultChecked />
              <div className="grid">
                <div className="font-semibold text-[color:var(--tt-brown)]">到店取貨</div>
                <div className="text-sm text-[color:var(--tt-brown)]/70">最推薦，方便也更環保。</div>
              </div>
            </label>
            <label className="flex items-center gap-3 rounded-2xl border border-[color:var(--tt-border)] bg-white px-4 py-3">
              <input type="radio" name="fulfillmentMethod" value="SHIP" />
              <div className="grid">
                <div className="font-semibold text-[color:var(--tt-brown)]">宅配寄送（選填地址）</div>
                <div className="text-sm text-[color:var(--tt-brown)]/70">目前示範版運費為 0，可在後台調整規則。</div>
              </div>
            </label>
          </div>

          <div className="grid gap-3">
            <div className="font-semibold text-[color:var(--tt-brown)]">聯絡資訊</div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                name="recipientName"
                placeholder="收件人 / 取貨人姓名"
                className="h-12 rounded-2xl border border-[color:var(--tt-border)] bg-white px-4 text-[color:var(--tt-brown)]"
              />
              <input
                name="recipientPhone"
                placeholder="手機"
                className="h-12 rounded-2xl border border-[color:var(--tt-border)] bg-white px-4 text-[color:var(--tt-brown)]"
              />
            </div>
          </div>

          <div className="grid gap-3">
            <div className="font-semibold text-[color:var(--tt-brown)]">寄送地址（如選宅配）</div>
            <input
              name="shippingAddress1"
              placeholder="地址 1"
              className="h-12 rounded-2xl border border-[color:var(--tt-border)] bg-white px-4 text-[color:var(--tt-brown)]"
            />
            <input
              name="shippingAddress2"
              placeholder="地址 2（選填）"
              className="h-12 rounded-2xl border border-[color:var(--tt-border)] bg-white px-4 text-[color:var(--tt-brown)]"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                name="shippingCity"
                placeholder="城市/區"
                className="h-12 rounded-2xl border border-[color:var(--tt-border)] bg-white px-4 text-[color:var(--tt-brown)]"
              />
              <input
                name="shippingPostal"
                placeholder="郵遞區號"
                className="h-12 rounded-2xl border border-[color:var(--tt-border)] bg-white px-4 text-[color:var(--tt-brown)]"
              />
            </div>
          </div>

          <div className="grid gap-3">
            <div className="font-semibold text-[color:var(--tt-brown)]">備註（選填）</div>
            <textarea
              name="note"
              placeholder="例如：希望某天到店取貨、可聯絡時段…"
              className="min-h-24 rounded-2xl border border-[color:var(--tt-border)] bg-white p-4 text-[color:var(--tt-brown)]"
            />
          </div>

          <button type="submit" className="h-12 rounded-2xl bg-[color:var(--tt-brown)] text-[color:var(--tt-bg)] font-semibold">
            送出訂單
          </button>
          <div className="text-xs text-[color:var(--tt-brown)]/70">
            下單後可在「我的帳戶 → 訂單」查看狀態；銀行轉帳會顯示匯款資訊。
          </div>
        </form>

        <div className="rounded-[28px] border border-[color:var(--tt-border)] bg-white/70 p-5 h-fit">
          <div className="font-semibold text-[color:var(--tt-brown)]">訂單明細</div>
          <div className="mt-4 grid gap-3">
            {lines.map(({ it, qty, lineTotal }) => (
              <div key={it.productId} className="flex items-start justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <div className="line-clamp-2 text-[color:var(--tt-brown)]">{it.product.name}</div>
                  <div className="text-[color:var(--tt-brown)]/70">
                    {qty} × {formatTWD(it.product.priceCents)}
                  </div>
                </div>
                <div className="shrink-0 font-semibold text-[color:var(--tt-brown)]">{formatTWD(lineTotal)}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-[color:var(--tt-border)] grid gap-2 text-sm text-[color:var(--tt-brown)]/85">
            <div className="flex justify-between">
              <span>小計</span>
              <span>{formatTWD(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>運費</span>
              <span>{formatTWD(shipping)}</span>
            </div>
            <div className="mt-2 flex justify-between text-base font-semibold text-[color:var(--tt-brown)]">
              <span>合計</span>
              <span>{formatTWD(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}

