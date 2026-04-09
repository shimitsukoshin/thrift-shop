import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/Container";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";

function formatTWD(priceCents: number) {
  const n = Math.round(priceCents / 100);
  return `NT$ ${n.toLocaleString("zh-Hant-TW")}`;
}

export const dynamic = "force-dynamic";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const order = await prisma.order.findFirst({
    where: { id, userId: user.id },
    include: { items: true },
  });
  if (!order) return notFound();

  const isBank = order.paymentMethod === "BANK_TRANSFER";

  return (
    <Container className="py-10">
      <div className="grid gap-2">
        <h1 className="text-2xl font-bold text-[color:var(--tt-brown)]">訂單已建立</h1>
        <div className="text-sm text-[color:var(--tt-brown)]/75">訂單編號：{order.id}</div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-[28px] border border-[color:var(--tt-border)] bg-white/70 p-6 grid gap-4">
          <div className="font-semibold text-[color:var(--tt-brown)]">下一步</div>

          {isBank ? (
            <div className="grid gap-3 text-sm text-[color:var(--tt-brown)]/85 leading-7">
              <div className="rounded-2xl border border-[color:var(--tt-border)] bg-white p-4">
                <div className="font-semibold text-[color:var(--tt-brown)]">銀行轉帳資訊（請在後台設定）</div>
                <div className="mt-2">
                  銀行：<span className="font-semibold">（範例）XXX 銀行</span>
                  <br />
                  帳號：<span className="font-semibold">（範例）123-456-789012</span>
                  <br />
                  金額：<span className="font-semibold">{formatTWD(order.totalCents)}</span>
                </div>
                <div className="mt-2 text-xs text-[color:var(--tt-brown)]/70">
                  匯款後可在備註填寫末五碼，或透過 IG/LINE 告知店家對帳。
                </div>
              </div>
              <div className="text-xs text-[color:var(--tt-brown)]/70">
                付款確認後，訂單狀態會更新為「已付款」。
              </div>
            </div>
          ) : (
            <div className="grid gap-3 text-sm text-[color:var(--tt-brown)]/85 leading-7">
              <div className="rounded-2xl border border-[color:var(--tt-border)] bg-white p-4">
                <div className="font-semibold text-[color:var(--tt-brown)]">到店現金取貨</div>
                <div className="mt-2">
                  我們會為你保留商品，請到店出示訂單編號並付款取貨。
                </div>
                <div className="mt-2">
                  應付金額：<span className="font-semibold">{formatTWD(order.totalCents)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Link
              href="/account/orders"
              className="h-11 px-4 rounded-2xl bg-[color:var(--tt-accent)] text-white font-semibold grid place-items-center"
            >
              查看我的訂單
            </Link>
            <Link
              href="/"
              className="h-11 px-4 rounded-2xl border border-[color:var(--tt-border)] bg-white hover:bg-[color:var(--tt-muted)] text-[color:var(--tt-brown)] font-semibold grid place-items-center"
            >
              繼續逛逛
            </Link>
          </div>
        </div>

        <div className="rounded-[28px] border border-[color:var(--tt-border)] bg-white/70 p-5 h-fit">
          <div className="font-semibold text-[color:var(--tt-brown)]">明細</div>
          <div className="mt-4 grid gap-3 text-sm">
            {order.items.map((it) => (
              <div key={it.id} className="flex justify-between gap-3">
                <div className="min-w-0">
                  <div className="line-clamp-2 text-[color:var(--tt-brown)]">{it.productName}</div>
                  <div className="text-[color:var(--tt-brown)]/70">
                    {it.quantity} × {formatTWD(it.unitPriceCents)}
                  </div>
                </div>
                <div className="shrink-0 font-semibold text-[color:var(--tt-brown)]">
                  {formatTWD(it.unitPriceCents * it.quantity)}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-[color:var(--tt-border)] grid gap-2 text-sm text-[color:var(--tt-brown)]/85">
            <div className="flex justify-between">
              <span>小計</span>
              <span>{formatTWD(order.subtotalCents)}</span>
            </div>
            <div className="flex justify-between">
              <span>運費</span>
              <span>{formatTWD(order.shippingCents)}</span>
            </div>
            <div className="mt-2 flex justify-between text-base font-semibold text-[color:var(--tt-brown)]">
              <span>合計</span>
              <span>{formatTWD(order.totalCents)}</span>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}

