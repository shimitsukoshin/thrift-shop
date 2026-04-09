import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-bold text-[color:var(--tt-brown)]">使用者</h1>
      <div className="rounded-[28px] border border-[color:var(--tt-border)] bg-white/70 overflow-hidden">
        <div className="grid grid-cols-[1fr_160px_120px] px-4 py-3 text-xs font-semibold text-[color:var(--tt-brown)]/70 border-b border-[color:var(--tt-border)]">
          <div>電子信箱</div>
          <div>暱稱</div>
          <div>角色</div>
        </div>
        {users.map((u) => (
          <div key={u.id} className="grid grid-cols-[1fr_160px_120px] px-4 py-3 text-sm border-b border-[color:var(--tt-border)]">
            <div className="min-w-0">
              <div className="font-semibold text-[color:var(--tt-brown)] line-clamp-1">{u.email}</div>
              <div className="text-xs text-[color:var(--tt-brown)]/70">id: {u.id}</div>
            </div>
            <div className="text-[color:var(--tt-brown)]/80">{u.name ?? "—"}</div>
            <div className="text-[color:var(--tt-brown)]/80">{u.role}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

