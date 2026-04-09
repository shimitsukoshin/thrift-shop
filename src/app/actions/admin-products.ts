"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";

function parseImageUrls(raw: string) {
  return raw
    .split(/\r?\n|,/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function adminCreateProduct(formData: FormData) {
  await requireAdmin("/admin/products");

  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const wearNotes = String(formData.get("wearNotes") ?? "").trim() || null;
  const condition = String(formData.get("condition") ?? "USED");
  const price = Number(formData.get("price") ?? 0) || 0;
  const categoryId = String(formData.get("categoryId") ?? "");
  const quantity = Number(formData.get("quantity") ?? 0) || 0;
  const isActive = String(formData.get("isActive") ?? "on") === "on";
  const imagesRaw = String(formData.get("images") ?? "");

  const tags = [
    String(formData.get("tag_popular") ?? "") ? "popular" : null,
    String(formData.get("tag_on_sale") ?? "") ? "on-sale" : null,
  ].filter((t): t is string => Boolean(t));

  if (!name || !slug || !description || !categoryId) redirect("/admin/products/new?error=missing");

  const imageUrls = parseImageUrls(imagesRaw);

  const tagRows = await prisma.tag.findMany({ where: { slug: { in: tags } } });

  const p = await prisma.product.create({
    data: {
      name,
      slug,
      description,
      wearNotes,
      condition: condition === "NEW" ? "NEW" : "USED",
      priceCents: Math.round(price * 100),
      categoryId,
      isActive,
      images: { create: imageUrls.map((url, idx) => ({ url, sortOrder: idx })) },
      inventory: { create: { quantity: Math.max(0, Math.trunc(quantity)) } },
      tags: { create: tagRows.map((t) => ({ tagId: t.id })) },
    },
  });

  revalidatePath("/admin/products");
  redirect(`/admin/products/${p.id}`);
}

export async function adminUpdateProduct(formData: FormData) {
  await requireAdmin("/admin/products");

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const wearNotes = String(formData.get("wearNotes") ?? "").trim() || null;
  const condition = String(formData.get("condition") ?? "USED");
  const price = Number(formData.get("price") ?? 0) || 0;
  const categoryId = String(formData.get("categoryId") ?? "");
  const quantity = Number(formData.get("quantity") ?? 0) || 0;
  const isActive = String(formData.get("isActive") ?? "") === "on";
  const imagesRaw = String(formData.get("images") ?? "");

  const tags = [
    String(formData.get("tag_popular") ?? "") ? "popular" : null,
    String(formData.get("tag_on_sale") ?? "") ? "on-sale" : null,
  ].filter((t): t is string => Boolean(t));

  if (!id || !name || !slug || !description || !categoryId) redirect(`/admin/products/${id}?error=missing`);

  const imageUrls = parseImageUrls(imagesRaw);
  const tagRows = await prisma.tag.findMany({ where: { slug: { in: tags } } });

  await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        wearNotes,
        condition: condition === "NEW" ? "NEW" : "USED",
        priceCents: Math.round(price * 100),
        categoryId,
        isActive,
      },
    });

    await tx.inventory.upsert({
      where: { productId: id },
      create: { productId: id, quantity: Math.max(0, Math.trunc(quantity)) },
      update: { quantity: Math.max(0, Math.trunc(quantity)) },
    });

    await tx.productImage.deleteMany({ where: { productId: id } });
    if (imageUrls.length > 0) {
      await tx.productImage.createMany({
        data: imageUrls.map((url, idx) => ({ productId: id, url, sortOrder: idx })),
      });
    }

    await tx.productTag.deleteMany({ where: { productId: id } });
    if (tagRows.length > 0) {
      await tx.productTag.createMany({
        data: tagRows.map((t) => ({ productId: id, tagId: t.id })),
      });
    }
  });

  revalidatePath("/admin/products");
  revalidatePath(`/p/${slug}`);
  redirect(`/admin/products/${id}`);
}

export async function adminDeleteProduct(formData: FormData) {
  await requireAdmin("/admin/products");

  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

