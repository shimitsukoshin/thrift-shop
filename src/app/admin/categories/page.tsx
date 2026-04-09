import { prisma } from "@/lib/prisma";
import { adminCreateCategory, adminDeleteCategory, adminUpdateCategory } from "@/app/actions/admin-categories";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const categories = await prisma.category.findMany({
    orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
  });

  const top = categories.filter((c) => !c.parentId);

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-bold text-[color:var(--tt-brown)]">分類管理</h1>

      {sp.error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {sp.error === "missing"
            ? "請填寫必填欄位（名稱、slug）。"
            : sp.error === "not-empty"
              ? "此分類底下仍有子分類或商品，無法刪除。"
              : "操作失敗，請再試一次。"}
        </div>
      ) : null}

      <div className="rounded-[28px] border border-[color:var(--tt-border)] bg-white/70 p-6 grid gap-3">
        <div className="font-semibold text-[color:var(--tt-brown)]">新增分類</div>
        <form action={adminCreateCategory} className="grid gap-3 md:grid-cols-5">
          <input name="name" placeholder="名稱（必填）" className="h-12 rounded-2xl border border-[color:var(--tt-border)] bg-white px-4 md:col-span-2" required />
          <input name="slug" placeholder="代稱（slug，必填）" className="h-12 rounded-2xl border border-[color:var(--tt-border)] bg-white px-4" required />
          <select name="parentId" className="h-12 rounded-2xl border border-[color:var(--tt-border)] bg-white px-4">
            <option value="">（頂層分類）</option>
            {top.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input name="sortOrder" inputMode="numeric" placeholder="排序" className="h-12 rounded-2xl border border-[color:var(--tt-border)] bg-white px-4" />
          <button type="submit" className="h-12 rounded-2xl bg-[color:var(--tt-brown)] text-[color:var(--tt-bg)] font-semibold md:col-span-5">
            建立分類
          </button>
        </form>
      </div>

      <div className="rounded-[28px] border border-[color:var(--tt-border)] bg-white/70 overflow-hidden">
        <div className="px-4 py-3 text-xs font-semibold text-[color:var(--tt-brown)]/70 border-b border-[color:var(--tt-border)]">
          現有分類（可直接編輯後按儲存）
        </div>
        <div className="divide-y divide-[color:var(--tt-border)]">
          {categories.map((c) => (
            <div key={c.id} className="p-4">
              <div className="text-xs text-[color:var(--tt-brown)]/60">
                {c.parentId ? "子分類" : "頂層分類"} · id: {c.id}
              </div>
              <div className="mt-2 grid gap-2 md:grid-cols-6">
                <form action={adminUpdateCategory} className="contents">
                  <input type="hidden" name="id" value={c.id} />
                  <input name="name" defaultValue={c.name} className="h-11 rounded-2xl border border-[color:var(--tt-border)] bg-white px-3 md:col-span-2" />
                  <input name="slug" defaultValue={c.slug} className="h-11 rounded-2xl border border-[color:var(--tt-border)] bg-white px-3" />
                  <select name="parentId" defaultValue={c.parentId ?? ""} className="h-11 rounded-2xl border border-[color:var(--tt-border)] bg-white px-3">
                    <option value="">（頂層分類）</option>
                    {top.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <input name="sortOrder" defaultValue={c.sortOrder} className="h-11 rounded-2xl border border-[color:var(--tt-border)] bg-white px-3" />
                  <button type="submit" className="h-11 rounded-2xl bg-[color:var(--tt-accent)] text-white font-semibold">
                    儲存
                  </button>
                </form>
              </div>
              <form action={adminDeleteCategory} className="mt-2">
                <input type="hidden" name="id" value={c.id} />
                <button type="submit" className="h-10 px-3 rounded-2xl border border-red-200 bg-red-50 text-red-800 text-sm">
                  刪除（需無子分類/商品）
                </button>
              </form>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

