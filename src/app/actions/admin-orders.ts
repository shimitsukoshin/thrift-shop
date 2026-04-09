"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";

export async function adminUpdateOrder(formData: FormData) {
  await requireAdmin("/admin/orders");

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const paymentStatus = String(formData.get("paymentStatus") ?? "");

  if (!id) return;

  const data: Partial<{
    status: "PENDING" | "PAID" | "SHIPPED" | "COMPLETED" | "CANCELLED";
    paymentStatus: "UNPAID" | "PAID";
    paidAt: Date;
    shippedAt: Date;
    completedAt: Date;
    cancelledAt: Date;
  }> = {};
  if (["PENDING", "PAID", "SHIPPED", "COMPLETED", "CANCELLED"].includes(status)) {
    data.status = status as "PENDING" | "PAID" | "SHIPPED" | "COMPLETED" | "CANCELLED";
  }
  if (["UNPAID", "PAID"].includes(paymentStatus)) {
    data.paymentStatus = paymentStatus as "UNPAID" | "PAID";
  }

  if (data.paymentStatus === "PAID") data.paidAt = new Date();
  if (data.status === "SHIPPED") data.shippedAt = new Date();
  if (data.status === "COMPLETED") data.completedAt = new Date();
  if (data.status === "CANCELLED") data.cancelledAt = new Date();

  await prisma.order.update({ where: { id }, data });
  revalidatePath("/admin/orders");
  redirect("/admin/orders");
}

