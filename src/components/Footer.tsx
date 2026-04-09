import { Container } from "@/components/Container";

export function Footer() {
  return (
    <footer className="mt-14 border-t border-[color:var(--tt-border)] bg-[color:var(--tt-bg)]">
      <Container className="py-10 grid gap-6 sm:grid-cols-3">
        <div className="grid gap-2">
          <div className="font-semibold text-[color:var(--tt-brown)]">愛地球二手好物</div>
          <div className="text-sm text-[color:var(--tt-brown)]/80">
            溫暖 × 實用 × 尋寶體驗的二手選物店
          </div>
        </div>
        <div className="grid gap-2 text-sm">
          <div className="font-semibold text-[color:var(--tt-brown)]">聯絡</div>
          <div className="text-[color:var(--tt-brown)]/80">Instagram / LINE：請填入你的帳號</div>
          <div className="text-[color:var(--tt-brown)]/80">地址：請填入店址</div>
        </div>
        <div className="grid gap-2 text-sm">
          <div className="font-semibold text-[color:var(--tt-brown)]">服務</div>
          <div className="text-[color:var(--tt-brown)]/80">付款：銀行轉帳／到店現金</div>
          <div className="text-[color:var(--tt-brown)]/80">出貨：店取／宅配（可選）</div>
        </div>
      </Container>
      <div className="border-t border-[color:var(--tt-border)]">
        <Container className="py-4 text-xs text-[color:var(--tt-brown)]/70">
          © {new Date().getFullYear()} 愛地球二手好物 保留所有權利
        </Container>
      </div>
    </footer>
  );
}

