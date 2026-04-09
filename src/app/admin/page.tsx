import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const [productCount, orderCount, userCount] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count(),
  ]);

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-bold text-[color:var(--tt-brown)]">概覽</h1>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-[28px] border border-[color:var(--tt-border)] bg-white/70 p-5">
          <div className="text-sm text-[color:var(--tt-brown)]/70">商品</div>
          <div className="mt-2 text-2xl font-bold text-[color:var(--tt-brown)]">{productCount}</div>
        </div>
        <div className="rounded-[28px] border border-[color:var(--tt-border)] bg-white/70 p-5">
          <div className="text-sm text-[color:var(--tt-brown)]/70">訂單</div>
          <div className="mt-2 text-2xl font-bold text-[color:var(--tt-brown)]">{orderCount}</div>
        </div>
        <div className="rounded-[28px] border border-[color:var(--tt-border)] bg-white/70 p-5">
          <div className="text-sm text-[color:var(--tt-brown)]/70">使用者</div>
          <div className="mt-2 text-2xl font-bold text-[color:var(--tt-brown)]">{userCount}</div>
        </div>
      </div>
    </div>
  );
}

