"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";

export async function adminCreateCategory(formData: FormData) {
  await requireAdmin("/admin/categories");

  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const parentIdRaw = String(formData.get("parentId") ?? "");
  const parentId = parentIdRaw || null;
  const sortOrder = Number(formData.get("sortOrder") ?? 0) || 0;

  if (!name || !slug) redirect("/admin/categories?error=missing");

  await prisma.category.create({
    data: { name, slug, parentId, sortOrder: Math.trunc(sortOrder) },
  });

  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function adminUpdateCategory(formData: FormData) {
  await requireAdmin("/admin/categories");

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const parentIdRaw = String(formData.get("parentId") ?? "");
  const parentId = parentIdRaw || null;
  const sortOrder = Number(formData.get("sortOrder") ?? 0) || 0;

  if (!id || !name || !slug) redirect("/admin/categories?error=missing");

  await prisma.category.update({
    where: { id },
    data: { name, slug, parentId, sortOrder: Math.trunc(sortOrder) },
  });

  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function adminDeleteCategory(formData: FormData) {
  await requireAdmin("/admin/categories");

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  // Safety: only allow delete if no products and no children
  const [childCount, productCount] = await Promise.all([
    prisma.category.count({ where: { parentId: id } }),
    prisma.product.count({ where: { categoryId: id } }),
  ]);
  if (childCount > 0 || productCount > 0) redirect("/admin/categories?error=not-empty");

  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

