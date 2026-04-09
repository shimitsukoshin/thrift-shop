import "server-only";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export async function getCurrentUser() {
  const session = await getSession();
  return session.user ?? null;
}

export async function requireUser(returnTo?: string) {
  const user = await getCurrentUser();
  if (!user) {
    const next = returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : "";
    redirect(`/login${next}`);
  }
  return user;
}

export async function requireAdmin(returnTo?: string) {
  const user = await requireUser(returnTo);
  if (user.role !== "ADMIN") redirect("/");
  return user;
}

