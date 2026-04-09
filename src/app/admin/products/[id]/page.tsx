import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { adminDeleteProduct, adminUpdateProduct } from "@/app/actions/admin-products";

export const dynamic = "force-dynamic";

export default async function AdminProductDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;

  const [product, categories, tags] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        inventory: true,
        tags: { include: { tag: true } },
      },
    }),
    prisma.category.findMany({ orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }] }),
    prisma.tag.findMany({ orderBy: { slug: "asc" } }),
  ]);

  if (!product) return notFound();

  const tagSlugs = new Set(product.tags.map((t) => t.tag.slug));

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[color:var(--tt-brown)]">編輯商品</h1>
          <div className="mt-1 text-sm text-[color:var(--tt-brown)]/70">{product.name}</div>
        </div>
        <div className="flex gap-2">
          <Link href={`/p/${product.slug}`} className="h-11 px-4 rounded-2xl border border-[color:var(--tt-border)] bg-white hover:bg-[color:var(--tt-muted)] grid place-items-center">
            前台查看
          </Link>
          <Link href="/admin/products" className="h-11 px-4 rounded-2xl border border-[color:var(--tt-border)] bg-white hover:bg-[color:var(--tt-muted)] grid place-items-center">
            回列表
          </Link>
        </div>
      </div>

      {sp.error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          請填寫必填欄位（名稱、slug、描述、分類）。
        </div>
      ) : null}

      <div className="rounded-[28px] border border-[color:var(--tt-border)] bg-white/70 p-6 grid gap-4">
        <form action={adminUpdateProduct} className="grid gap-4">
        <input type="hidden" name="id" value={product.id} />

        <div className="grid gap-3 sm:grid-cols-2">
          <input name="name" defaultValue={product.name} placeholder="商品名稱（必填）" className="h-12 rounded-2xl border border-[color:var(--tt-border)] bg-white px-4" required />
          <input name="slug" defaultValue={product.slug} placeholder="代稱（slug，必填）" className="h-12 rounded-2xl border border-[color:var(--tt-border)] bg-white px-4" required />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <select name="categoryId" defaultValue={product.categoryId} className="h-12 rounded-2xl border border-[color:var(--tt-border)] bg-white px-4" required>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.parentId ? `└ ${c.name}` : c.name}
              </option>
            ))}
          </select>
          <select name="condition" defaultValue={product.condition} className="h-12 rounded-2xl border border-[color:var(--tt-border)] bg-white px-4">
            <option value="USED">二手</option>
            <option value="NEW">全新</option>
          </select>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <input
            name="price"
            inputMode="decimal"
            defaultValue={(product.priceCents / 100).toFixed(0)}
            placeholder="售價（NT$）"
            className="h-12 rounded-2xl border border-[color:var(--tt-border)] bg-white px-4"
          />
          <input
            name="quantity"
            inputMode="numeric"
            defaultValue={product.inventory?.quantity ?? 0}
            placeholder="庫存數量"
            className="h-12 rounded-2xl border border-[color:var(--tt-border)] bg-white px-4"
          />
        </div>

        <textarea name="description" defaultValue={product.description} placeholder="商品描述（必填）" className="min-h-28 rounded-2xl border border-[color:var(--tt-border)] bg-white p-4" required />
        <textarea name="wearNotes" defaultValue={product.wearNotes ?? ""} placeholder="使用狀況 / 磨損說明（選填）" className="min-h-24 rounded-2xl border border-[color:var(--tt-border)] bg-white p-4" />

        <textarea
          name="images"
          defaultValue={product.images.map((i) => i.url).join("\n")}
          placeholder="圖片 URL（逗號或換行分隔）"
          className="min-h-24 rounded-2xl border border-[color:var(--tt-border)] bg-white p-4"
        />

        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="tag_popular" value="1" defaultChecked={tagSlugs.has("popular")} />
            popular（熱門）
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="tag_on_sale" value="1" defaultChecked={tagSlugs.has("on-sale")} />
            on sale（特價）
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="isActive" defaultChecked={product.isActive} />
            上架
          </label>
        </div>

        <div className="flex flex-wrap gap-3">
          <button type="submit" className="h-12 px-5 rounded-2xl bg-[color:var(--tt-brown)] text-[color:var(--tt-bg)] font-semibold">
            儲存
          </button>
        </div>

        <div className="text-xs text-[color:var(--tt-brown)]/70">
          可用標籤：{tags.map((t) => t.slug).join(", ")}
        </div>
        </form>

        <form action={adminDeleteProduct}>
          <input type="hidden" name="id" value={product.id} />
          <button type="submit" className="h-12 px-5 rounded-2xl border border-red-200 bg-red-50 text-red-800 font-semibold">
            刪除商品
          </button>
        </form>
      </div>
    </div>
  );
}

