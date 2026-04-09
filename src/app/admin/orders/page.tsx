import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { adminUpdateOrder } from "@/app/actions/admin-orders";
import { fulfillmentMethodLabel, orderStatusLabel, paymentMethodLabel, paymentStatusLabel } from "@/lib/order-labels";

function formatTWD(priceCents: number) {
  const n = Math.round(priceCents / 100);
  return `NT$ ${n.toLocaleString("zh-Hant-TW")}`;
}

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true, items: { take: 2 } },
    take: 80,
  });

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-bold text-[color:var(--tt-brown)]">訂單管理</h1>

      <div className="grid gap-3">
        {orders.map((o) => (
          <div key={o.id} className="rounded-[28px] border border-[color:var(--tt-border)] bg-white/70 p-5 grid gap-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="grid gap-1">
                <div className="font-semibold text-[color:var(--tt-brown)]">訂單 {o.id}</div>
                <div className="text-xs text-[color:var(--tt-brown)]/70">
                  {o.createdAt.toISOString().slice(0, 10)} · {o.user.email}
                </div>
                <div className="text-xs text-[color:var(--tt-brown)]/70">
                  {o.items.map((it) => it.productName).join("、")}
                  {o.items.length >= 2 ? "…" : ""}
                </div>
              </div>
              <div className="text-sm font-semibold text-[color:var(--tt-brown)]">{formatTWD(o.totalCents)}</div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-[color:var(--tt-border)] bg-white p-4 text-sm text-[color:var(--tt-brown)]/85">
                <div className="font-semibold text-[color:var(--tt-brown)]">付款/取貨</div>
                <div className="mt-1">付款方式：{paymentMethodLabel(o.paymentMethod)}</div>
                <div>付款狀態：{paymentStatusLabel(o.paymentStatus)}</div>
                <div>取貨方式：{fulfillmentMethodLabel(o.fulfillmentMethod)}</div>
              </div>
              <form action={adminUpdateOrder} className="rounded-2xl border border-[color:var(--tt-border)] bg-white p-4 grid gap-2">
                <input type="hidden" name="id" value={o.id} />
                <div className="font-semibold text-[color:var(--tt-brown)]">更新狀態</div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <select name="status" defaultValue={o.status} className="h-11 rounded-2xl border border-[color:var(--tt-border)] bg-white px-3">
                    <option value="PENDING">{orderStatusLabel("PENDING")}</option>
                    <option value="PAID">{orderStatusLabel("PAID")}</option>
                    <option value="SHIPPED">{orderStatusLabel("SHIPPED")}</option>
                    <option value="COMPLETED">{orderStatusLabel("COMPLETED")}</option>
                    <option value="CANCELLED">{orderStatusLabel("CANCELLED")}</option>
                  </select>
                  <select name="paymentStatus" defaultValue={o.paymentStatus} className="h-11 rounded-2xl border border-[color:var(--tt-border)] bg-white px-3">
                    <option value="UNPAID">{paymentStatusLabel("UNPAID")}</option>
                    <option value="PAID">{paymentStatusLabel("PAID")}</option>
                  </select>
                </div>
                <button type="submit" className="h-11 rounded-2xl bg-[color:var(--tt-accent)] text-white font-semibold">
                  儲存更新
                </button>
                <Link href={`/order/${o.id}`} className="text-xs text-[color:var(--tt-green)] hover:underline">
                  前台訂單頁（以會員身份查看）
                </Link>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

