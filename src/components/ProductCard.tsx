import Link from "next/link";

import type { ProductCondition } from "@prisma/client";

function formatTWD(priceCents: number) {
  const n = Math.round(priceCents / 100);
  return `NT$ ${n.toLocaleString("zh-Hant-TW")}`;
}

export function ProductCard({
  product,
}: {
  product: {
    id: string;
    slug: string;
    name: string;
    priceCents: number;
    condition: ProductCondition;
    imageUrl: string | null;
    tagLabels: string[];
    soldOut: boolean;
  };
}) {
  return (
    <Link
      href={`/p/${product.slug}`}
      className="group overflow-hidden rounded-3xl bg-white shadow-sm hover:shadow-md transition border border-[color:var(--tt-border)]"
    >
      <div className="relative aspect-square bg-[color:var(--tt-muted)]">
        {product.imageUrl ? (
          // Using img keeps SVG placeholders simple (and supports external URLs later)
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover group-hover:scale-[1.02] transition"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full grid place-items-center text-[color:var(--tt-brown)]/70 text-sm">
            尚無圖片
          </div>
        )}

        {product.soldOut && (
          <div className="absolute inset-0 grid place-items-center bg-black/35 text-white font-semibold">
            已售完
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-[color:var(--tt-green)] px-2.5 py-1 text-xs text-white">
            {product.condition === "NEW" ? "全新" : "二手"}
          </span>
          {product.tagLabels.slice(0, 1).map((t) => (
            <span key={t} className="rounded-full bg-[color:var(--tt-accent)] px-2.5 py-1 text-xs text-white">
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="p-3.5">
        <div className="line-clamp-2 text-sm font-semibold text-[color:var(--tt-brown)]">{product.name}</div>
        <div className="mt-2 text-sm text-[color:var(--tt-brown)]/90">{formatTWD(product.priceCents)}</div>
      </div>
    </Link>
  );
}

