# 二手選物電商（銀行轉帳／到店現金）

這是一個 **Next.js App Router + Prisma + SQLite** 的完整二手電商專案，包含：

- 前台：首頁／分類（完整樹狀）／搜尋與篩選／商品頁（多圖、全新/二手、磨損說明）／購物車／結帳
- 會員：註冊/登入/登出、訂單紀錄、收藏清單
- 後台：商品 CRUD、分類管理、訂單管理（更新狀態/付款狀態）、使用者列表
- 付款：**銀行轉帳 / 到店現金**（示範版：下單後由店家人工確認）

## 技術棧
- **Frontend/Backend**：Next.js (React)（同一專案內建 API/Server Actions）
- **DB**：SQLite（本機開發最方便；可改成 PostgreSQL）
- **ORM**：Prisma ORM v7（使用 `@prisma/adapter-better-sqlite3`）
- **Auth**：iron-session（Cookie Session）+ bcryptjs（密碼雜湊）
- **UI**：Tailwind CSS（配色/圓角/陰影符合「溫暖極簡二手店」）

## 快速開始（本機）
1) 安裝依賴

```bash
npm install
```

2) 建立資料庫 + migration

```bash
npx prisma migrate dev --name init
npx prisma generate
```

3) 匯入 seed（完整分類樹 + 範例商品 + 管理員）

```bash
npm run db:seed
```

seed 會建立管理員：
- **Email**：`admin@local.test`
- **Password**：`Admin12345!`

4) 啟動

```bash
npm run dev
```

打開 `http://localhost:3000`

## 重要環境變數
專案根目錄 `.env`（已建立示範值）：

- `DATABASE_URL="file:./dev.db"`
- `SESSION_PASSWORD="..."`（請換成至少 32 字以上的長隨機字串）

## 後台入口
- 後台首頁：`/admin`

## 銀行轉帳資訊（示範版）
目前匯款資訊是寫在 `src/app/order/[id]/page.tsx` 的示範內容。

建議做法（下一步擴充）：
- 建一張 `store_settings` 表（或環境變數）保存：銀行名稱、分行、戶名、帳號、備註規則
- 訂單頁與結帳頁讀取設定後顯示

## 部署建議（正式上線）
### DB 改 PostgreSQL（推薦）
- 建議用 Neon / Supabase（托管 Postgres）
- 將 `.env` 改成 `DATABASE_URL="postgresql://..."`
- 更新 `prisma/schema.prisma` 的 datasource provider（改成 `postgresql`）
- 依 Prisma v7 指南調整 adapter（Postgres 需使用對應 adapter，例如 `@prisma/adapter-pg`）

### 圖片儲存
- 本專案後台目前用「圖片 URL」輸入（可直接貼 CDN/S3/R2 連結）
- 正式版建議：Cloudflare R2 / AWS S3 + 預簽名上傳（避免把圖片存在 web server）

### Hosting
- Next.js：Vercel
- DB：Neon / Supabase
- 圖片：R2/S3

## 常用指令
```bash
npm run dev
npm run lint
npm run build
npm run db:migrate
npm run db:seed
npm run db:studio
```
