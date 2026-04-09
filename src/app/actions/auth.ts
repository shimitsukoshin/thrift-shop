"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function register(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim() || null;
  const returnTo = String(formData.get("returnTo") ?? "/");

  if (!email || !password || password.length < 8) {
    redirect(`/register?error=invalid&returnTo=${encodeURIComponent(returnTo)}`);
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) redirect(`/login?error=exists&returnTo=${encodeURIComponent(returnTo)}`);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash: await bcrypt.hash(password, 12),
      role: "CUSTOMER",
    },
  });

  const session = await getSession();
  session.user = { id: user.id, email: user.email, name: user.name, role: user.role };
  await session.save();

  redirect(returnTo || "/");
}

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const returnTo = String(formData.get("returnTo") ?? "/");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) redirect(`/login?error=invalid&returnTo=${encodeURIComponent(returnTo)}`);

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) redirect(`/login?error=invalid&returnTo=${encodeURIComponent(returnTo)}`);

  const session = await getSession();
  session.user = { id: user.id, email: user.email, name: user.name, role: user.role };
  await session.save();

  redirect(returnTo || "/");
}

export async function logout() {
  const session = await getSession();
  session.destroy();
  redirect("/");
}

