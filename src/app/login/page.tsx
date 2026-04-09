import Link from "next/link";

import { Container } from "@/components/Container";
import { login } from "@/app/actions/auth";
import { getCurrentUser } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string; error?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/account");

  const sp = await searchParams;
  const returnTo = sp.returnTo ?? "/";
  const error = sp.error ?? "";

  return (
    <Container className="py-10">
      <div className="mx-auto max-w-md rounded-[28px] border border-[color:var(--tt-border)] bg-white/70 p-6">
        <h1 className="text-2xl font-bold text-[color:var(--tt-brown)]">登入</h1>
        <p className="mt-2 text-sm text-[color:var(--tt-brown)]/75">查看訂單、收藏清單與購物車。</p>

        {error ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error === "invalid" ? "帳號或密碼錯誤。" : "登入發生問題，請再試一次。"}
          </div>
        ) : null}

        <form action={login} className="mt-6 grid gap-3">
          <input type="hidden" name="returnTo" value={returnTo} />
          <input
            name="email"
            type="email"
            placeholder="電子信箱"
            className="h-12 rounded-2xl border border-[color:var(--tt-border)] bg-white px-4 text-[color:var(--tt-brown)]"
            required
          />
          <input
            name="password"
            type="password"
            placeholder="密碼"
            className="h-12 rounded-2xl border border-[color:var(--tt-border)] bg-white px-4 text-[color:var(--tt-brown)]"
            required
          />
          <button type="submit" className="h-12 rounded-2xl bg-[color:var(--tt-brown)] text-[color:var(--tt-bg)] font-semibold">
            登入
          </button>
        </form>

        <div className="mt-4 text-sm text-[color:var(--tt-brown)]/80">
          還沒有帳號？{" "}
          <Link href={`/register?returnTo=${encodeURIComponent(returnTo)}`} className="text-[color:var(--tt-green)] hover:underline">
            註冊
          </Link>
        </div>
      </div>
    </Container>
  );
}

