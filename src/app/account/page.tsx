import Link from "next/link";

import { Container } from "@/components/Container";
import { requireUser } from "@/lib/auth-helpers";
import { logout } from "@/app/actions/auth";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await requireUser("/account");

  return (
    <Container className="py-10">
      <h1 className="text-2xl font-bold text-[color:var(--tt-brown)]">我的帳戶</h1>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="rounded-[28px] border border-[color:var(--tt-border)] bg-white/70 p-6 grid gap-3">
          <div className="font-semibold text-[color:var(--tt-brown)]">個人資料</div>
          <div className="text-sm text-[color:var(--tt-brown)]/80">電子信箱：{user.email}</div>
          <div className="text-sm text-[color:var(--tt-brown)]/80">暱稱：{user.name ?? "—"}</div>
          <div className="text-sm text-[color:var(--tt-brown)]/80">身份：{user.role === "ADMIN" ? "管理員" : "會員"}</div>
        </div>

        <div className="rounded-[28px] border border-[color:var(--tt-border)] bg-white/70 p-6 grid gap-3 h-fit">
          <div className="font-semibold text-[color:var(--tt-brown)]">快速入口</div>
          <Link href="/account/orders" className="rounded-2xl border border-[color:var(--tt-border)] bg-white px-4 py-3 hover:bg-[color:var(--tt-muted)]">
            訂單紀錄 →
          </Link>
          <Link href="/account/wishlist" className="rounded-2xl border border-[color:var(--tt-border)] bg-white px-4 py-3 hover:bg-[color:var(--tt-muted)]">
            收藏清單 →
          </Link>
          {user.role === "ADMIN" ? (
            <Link href="/admin" className="rounded-2xl border border-[color:var(--tt-border)] bg-white px-4 py-3 hover:bg-[color:var(--tt-muted)]">
              管理後台 →
            </Link>
          ) : null}

          <form action={logout}>
            <button
              type="submit"
              className="mt-2 w-full h-11 rounded-2xl bg-[color:var(--tt-brown)] text-[color:var(--tt-bg)] font-semibold"
            >
              登出
            </button>
          </form>
        </div>
      </div>
    </Container>
  );
}

