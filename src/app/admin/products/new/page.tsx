import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { adminCreateProduct } from "@/app/actions/admin-products";

export const dynamic = "force-dynamic";

export default async function AdminNewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const categories = await prisma.category.findMany({
    orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }],
  });

  return (
    <div className="grid gap-4">
      <div className="flex items-end justify-between gap-3">
        <h1 className="text-2xl font-bold text-[color:var(--tt-brown)]">新增商品</h1>
        <Link href="/admin/products" className="text-sm text-[color:var(--tt-green)] hover:underline">
          回商品列表 →
        </Link>
      </div>

      {sp.error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          請填寫必填欄位（名稱、slug、描述、分類）。
        </div>
      ) : null}

      <form action={adminCreateProduct} className="rounded-[28px] border border-[color:var(--tt-border)] bg-white/70 p-6 grid gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <input name="name" placeholder="商品名稱（必填）" className="h-12 rounded-2xl border border-[color:var(--tt-border)] bg-white px-4" required />
          <input name="slug" placeholder="代稱（slug，必填，例如: warm-mug）" className="h-12 rounded-2xl border border-[color:var(--tt-border)] bg-white px-4" required />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <select name="categoryId" className="h-12 rounded-2xl border border-[color:var(--tt-border)] bg-white px-4" required>
            <option value="">選擇分類（必填）</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.parentId ? `└ ${c.name}` : c.name}
              </option>
            ))}
          </select>
          <select name="condition" className="h-12 rounded-2xl border border-[color:var(--tt-border)] bg-white px-4">
            <option value="USED">二手</option>
            <option value="NEW">全新</option>
          </select>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <input name="price" inputMode="decimal" placeholder="售價（NT$，例如 180）" className="h-12 rounded-2xl border border-[color:var(--tt-border)] bg-white px-4" />
          <input name="quantity" inputMode="numeric" placeholder="庫存數量（例如 3）" className="h-12 rounded-2xl border border-[color:var(--tt-border)] bg-white px-4" />
        </div>

        <textarea name="description" placeholder="商品描述（必填）" className="min-h-28 rounded-2xl border border-[color:var(--tt-border)] bg-white p-4" required />
        <textarea name="wearNotes" placeholder="使用狀況 / 磨損說明（選填）" className="min-h-24 rounded-2xl border border-[color:var(--tt-border)] bg-white p-4" />

        <textarea
          name="images"
          placeholder="圖片 URL（可多張，逗號或換行分隔，例如 /demo/mug.svg）"
          className="min-h-24 rounded-2xl border border-[color:var(--tt-border)] bg-white p-4"
        />

        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="tag_popular" value="1" />
            popular（熱門）
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="tag_on_sale" value="1" />
            on sale（特價）
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="isActive" defaultChecked />
            上架
          </label>
        </div>

        <button type="submit" className="h-12 rounded-2xl bg-[color:var(--tt-brown)] text-[color:var(--tt-bg)] font-semibold">
          建立商品
        </button>
      </form>
    </div>
  );
}

