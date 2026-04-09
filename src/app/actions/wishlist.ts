"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";

export async function toggleWishlist(formData: FormData) {
  const productId = String(formData.get("productId") ?? "");
  const returnTo = String(formData.get("returnTo") ?? "/account/wishlist");
  const user = await requireUser(returnTo);

  if (!productId) return;

  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId: user.id, productId } },
  });

  if (existing) {
    await prisma.wishlistItem.delete({
      where: { userId_productId: { userId: user.id, productId } },
    });
  } else {
    await prisma.wishlistItem.create({ data: { userId: user.id, productId } });
  }

  revalidatePath(returnTo);
}

