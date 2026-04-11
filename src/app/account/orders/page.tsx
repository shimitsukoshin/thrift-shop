import Link from "next/link";

import { Container } from "../../../components/Container";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { fulfillmentMethodLabel, orderStatusLabel, paymentMethodLabel, paymentStatusLabel } from "@/lib/order-labels";

function formatTWD(priceCents: number) {
  const n = Math.round(priceCents / 100);
  return `NT$ ${n.toLocaleString("zh-Hant-TW")}`;
}

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const user = await requireUser("/account/orders");

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { items: { take: 3 } },
    take: 30,
  });

  return (
    <Container className="py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[color:var(--tt-brown)]">訂單紀錄</h1>
          <div className="mt-1 text-sm text-[color:var(--tt-brown)]/70">共 {orders.length} 筆</div>
        </div>
        <Link href="/account" className="text-sm text-[color:var(--tt-green)] hover:underline">
          回我的帳戶 →
        </Link>
      </div>

      <div className="mt-6 grid gap-3">
        {orders.map((o: any) => ...)
          <Link
            key={o.id}
            href={`/order/${o.id}`}
            className="rounded-[28px] border border-[color:var(--tt-border)] bg-white/70 p-5 hover:bg-white transition"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="font-semibold text-[color:var(--tt-brown)]">訂單 {o.id}</div>
              <div className="text-sm text-[color:var(--tt-brown)]/75">
                {orderStatusLabel(o.status)} · {paymentStatusLabel(o.paymentStatus)} · {paymentMethodLabel(o.paymentMethod)} · {fulfillmentMethodLabel(o.fulfillmentMethod)}
              </div>
            </div>
            <div className="mt-2 text-sm text-[color:var(--tt-brown)]/80">
              合計：<span className="font-semibold">{formatTWD(o.totalCents)}</span>
            </div>
            <div className="mt-3 text-xs text-[color:var(--tt-brown)]/70">
              {o.items.map((it) => it.productName).join("、")}
              {o.items.length >= 3 ? "…" : ""}
            </div>
          </Link>
        ))}

        {orders.length === 0 ? (
          <div className="rounded-[28px] border border-[color:var(--tt-border)] bg-white/70 p-6 text-[color:var(--tt-brown)]">
            目前沒有訂單紀錄。
          </div>
        ) : null}
      </div>
    </Container>
  );
}

