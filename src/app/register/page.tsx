import Link from "next/link";
import { redirect } from "next/navigation";

import { Container } from "@/components/Container";
import { register } from "@/app/actions/auth";
import { getCurrentUser } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export default async function RegisterPage({
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
        <h1 className="text-2xl font-bold text-[color:var(--tt-brown)]">註冊</h1>
        <p className="mt-2 text-sm text-[color:var(--tt-brown)]/75">建立帳號後即可收藏、下單與查詢訂單。</p>

        {error ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error === "invalid" ? "請輸入有效電子信箱，密碼至少 8 碼。" : "註冊發生問題，請再試一次。"}
          </div>
        ) : null}

        <form action={register} className="mt-6 grid gap-3">
          <input type="hidden" name="returnTo" value={returnTo} />
          <input
            name="name"
            type="text"
            placeholder="暱稱（選填）"
            className="h-12 rounded-2xl border border-[color:var(--tt-border)] bg-white px-4 text-[color:var(--tt-brown)]"
          />
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
            placeholder="密碼（至少 8 碼）"
            className="h-12 rounded-2xl border border-[color:var(--tt-border)] bg-white px-4 text-[color:var(--tt-brown)]"
            required
          />
          <button type="submit" className="h-12 rounded-2xl bg-[color:var(--tt-brown)] text-[color:var(--tt-bg)] font-semibold">
            建立帳號
          </button>
        </form>

        <div className="mt-4 text-sm text-[color:var(--tt-brown)]/80">
          已有帳號？{" "}
          <Link href={`/login?returnTo=${encodeURIComponent(returnTo)}`} className="text-[color:var(--tt-green)] hover:underline">
            登入
          </Link>
        </div>
      </div>
    </Container>
  );
}

