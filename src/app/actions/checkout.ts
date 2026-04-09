"use server";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";

function calcTotals(lines: { priceCents: number; qty: number }[]) {
  const subtotalCents = lines.reduce((s, l) => s + l.priceCents * l.qty, 0);
  const shippingCents = 0;
  const totalCents = subtotalCents + shippingCents;
  return { subtotalCents, shippingCents, totalCents };
}

export async function createOrder(formData: FormData) {
  const user = await requireUser("/checkout");

  const paymentMethod = String(formData.get("paymentMethod") ?? "BANK_TRANSFER");
  const fulfillmentMethod = String(formData.get("fulfillmentMethod") ?? "PICKUP");

  const recipientName = String(formData.get("recipientName") ?? "").trim() || null;
  const recipientPhone = String(formData.get("recipientPhone") ?? "").trim() || null;
  const shippingAddress1 = String(formData.get("shippingAddress1") ?? "").trim() || null;
  const shippingAddress2 = String(formData.get("shippingAddress2") ?? "").trim() || null;
  const shippingCity = String(formData.get("shippingCity") ?? "").trim() || null;
  const shippingPostal = String(formData.get("shippingPostal") ?? "").trim() || null;
  const note = String(formData.get("note") ?? "").trim() || null;

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: user.id },
    include: { product: { include: { inventory: true } } },
  });

  const validLines = cartItems
    .filter((it) => it.product.isActive)
    .map((it) => {
      const available = it.product.inventory?.quantity ?? 0;
      const qty = Math.min(it.quantity, available);
      return {
        productId: it.productId,
        productName: it.product.name,
        unitPriceCents: it.product.priceCents,
        qty,
        available,
      };
    })
    .filter((l) => l.qty > 0);

  if (validLines.length === 0) redirect("/cart");

  const totals = calcTotals(validLines.map((l) => ({ priceCents: l.unitPriceCents, qty: l.qty })));

  const order = await prisma.$transaction(async (tx) => {
    // Re-check inventory inside the transaction
    for (const line of validLines) {
      const inv = await tx.inventory.findUnique({ where: { productId: line.productId } });
      const availableNow = inv?.quantity ?? 0;
      if (availableNow < line.qty) {
        throw new Error("INSUFFICIENT_STOCK");
      }
    }

    const created = await tx.order.create({
      data: {
        userId: user.id,
        status: "PENDING",
        paymentMethod: paymentMethod === "CASH_ON_PICKUP" ? "CASH_ON_PICKUP" : "BANK_TRANSFER",
        paymentStatus: "UNPAID",
        fulfillmentMethod: fulfillmentMethod === "SHIP" ? "SHIP" : "PICKUP",
        subtotalCents: totals.subtotalCents,
        shippingCents: totals.shippingCents,
        totalCents: totals.totalCents,
        recipientName,
        recipientPhone,
        shippingAddress1,
        shippingAddress2,
        shippingCity,
        shippingPostal,
        note,
        items: {
          create: validLines.map((l) => ({
            productId: l.productId,
            productName: l.productName,
            unitPriceCents: l.unitPriceCents,
            quantity: l.qty,
          })),
        },
      },
    });

    for (const line of validLines) {
      await tx.inventory.update({
        where: { productId: line.productId },
        data: { quantity: { decrement: line.qty } },
      });
    }

    await tx.cartItem.deleteMany({ where: { userId: user.id } });

    return created;
  });

  redirect(`/order/${order.id}`);
}

