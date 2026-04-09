import Link from "next/link";

import { Container } from "@/components/Container";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { sortOrder: "asc" },
    include: { children: { orderBy: { sortOrder: "asc" } } },
  });

  return (
    <Container className="py-10">
      <div className="grid gap-2">
        <h1 className="text-2xl font-bold text-[color:var(--tt-brown)]">全部分類</h1>
        <p className="text-sm text-[color:var(--tt-brown)]/75">
          依生活場景挑選，慢慢逛、慢慢找。
        </p>
      </div>

      <div className="mt-6 grid gap-4">
        {categories.map((c) => (
          <div
            key={c.id}
            className="rounded-[28px] border border-[color:var(--tt-border)] bg-white/70 p-5"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="text-lg font-semibold text-[color:var(--tt-brown)]">{c.name}</div>
              <Link
                href={`/c/${c.slug}`}
                className="text-sm text-[color:var(--tt-green)] hover:underline"
              >
                查看 →
              </Link>
            </div>
            {c.children.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {c.children.map((sc) => (
                  <Link
                    key={sc.id}
                    href={`/c/${sc.slug}`}
                    className="rounded-full border border-[color:var(--tt-border)] bg-white px-3 py-1 text-sm text-[color:var(--tt-brown)] hover:bg-[color:var(--tt-muted)]"
                  >
                    {sc.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </Container>
  );
}

