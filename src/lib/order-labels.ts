export function orderStatusLabel(status: string): string {
  switch (status) {
    case "PENDING":
      return "待處理";
    case "PAID":
      return "已付款";
    case "SHIPPED":
      return "已出貨";
    case "COMPLETED":
      return "已完成";
    case "CANCELLED":
      return "已取消";
    default:
      return status;
  }
}

export function paymentStatusLabel(status: string): string {
  switch (status) {
    case "UNPAID":
      return "未付款";
    case "PAID":
      return "已付款";
    default:
      return status;
  }
}

export function paymentMethodLabel(method: string): string {
  switch (method) {
    case "BANK_TRANSFER":
      return "銀行轉帳";
    case "CASH_ON_PICKUP":
      return "到店現金";
    default:
      return method;
  }
}

export function fulfillmentMethodLabel(method: string): string {
  switch (method) {
    case "PICKUP":
      return "到店取貨";
    case "SHIP":
      return "宅配寄送";
    default:
      return method;
  }
}

