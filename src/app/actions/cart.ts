"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";

export async function addToCart(formData: FormData) {
  const productId = String(formData.get("productId") ?? "");
  const qty = Math.max(1, Number(formData.get("qty") ?? 1) || 1);
  const returnTo = String(formData.get("returnTo") ?? "/cart");

  const user = await requireUser(returnTo);

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { inventory: true },
  });
  if (!product || !product.isActive) return;

  const available = product.inventory?.quantity ?? 0;
  if (available <= 0) return;

  const nextQty = Math.min(qty, available);

  await prisma.cartItem.upsert({
    where: { userId_productId: { userId: user.id, productId } },
    create: { userId: user.id, productId, quantity: nextQty },
    update: { quantity: { increment: nextQty } },
  });

  revalidatePath("/cart");
  revalidatePath(returnTo);
}

export async function updateCartItem(formData: FormData) {
  const productId = String(formData.get("productId") ?? "");
  const qty = Number(formData.get("qty") ?? 1);
  const user = await requireUser("/cart");

  if (!productId) return;
  if (qty <= 0) {
    await prisma.cartItem.delete({
      where: { userId_productId: { userId: user.id, productId } },
    });
    revalidatePath("/cart");
    return;
  }

  const inv = await prisma.inventory.findUnique({ where: { productId } });
  const available = inv?.quantity ?? 0;
  await prisma.cartItem.update({
    where: { userId_productId: { userId: user.id, productId } },
    data: { quantity: Math.min(qty, Math.max(1, available || 1)) },
  });
  revalidatePath("/cart");
}

export async function clearCart() {
  const user = await requireUser("/cart");
  await prisma.cartItem.deleteMany({ where: { userId: user.id } });
  revalidatePath("/cart");
}

