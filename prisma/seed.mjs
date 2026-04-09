import prismaPkg from "@prisma/client";
import bcrypt from "bcryptjs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const { PrismaClient, ProductCondition, UserRole } = prismaPkg;
const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function slugify(input) {
  return String(input)
    .trim()
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function upsertCategory({ name, slug, parentId, sortOrder }) {
  return await prisma.category.upsert({
    where: { slug },
    create: { name, slug, parentId, sortOrder },
    update: { name, parentId, sortOrder },
  });
}

async function main() {
  const adminEmail = "admin@local.test";
  const adminPassword = "Admin12345!";

  // Dev-friendly reset so category structure matches exactly.
  // If you want to preserve production data, replace this with a safe migration script.
  await prisma.$transaction([
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.cartItem.deleteMany(),
    prisma.wishlistItem.deleteMany(),
    prisma.productTag.deleteMany(),
    prisma.productImage.deleteMany(),
    prisma.inventory.deleteMany(),
    prisma.product.deleteMany(),
    prisma.category.deleteMany(),
    prisma.tag.deleteMany(),
  ]);

  await prisma.user.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 12),
      name: "Store Admin",
      role: UserRole.ADMIN,
    },
    update: {
      role: UserRole.ADMIN,
    },
  });

  const categoryTree = [
    { name: "衣服", slug: "衣服", children: [] },
    {
      name: "廚房用具",
      slug: "廚房用具",
      children: [
        { name: "居家清潔用品", slug: "居家清潔用品" },
        { name: "鍋子", slug: "鍋子" },
        { name: "保鮮盒", slug: "保鮮盒" },
      ],
    },
    {
      name: "日常用品",
      slug: "日常用品",
      children: [
        { name: "背掛繩", slug: "背掛繩" },
        { name: "布類", slug: "布類" },
        { name: "收納小物", slug: "收納小物" },
        { name: "鐘錶 / 燈泡 / 蠟燭", slug: "鐘錶-燈泡-蠟燭" },
        { name: "擺飾 / 相框", slug: "擺飾-相框" },
        { name: "小包袋 / 收納袋", slug: "小包袋-收納袋" },
      ],
    },
    {
      name: "容器類",
      slug: "容器類",
      children: [
        { name: "瓶子", slug: "瓶子" },
        { name: "杯子", slug: "杯子" },
        { name: "壺罐", slug: "壺罐" },
      ],
    },
    { name: "小家具", slug: "小家具", children: [] },
    { name: "小家電 / 3C", slug: "小家電-3c", children: [] },
    {
      name: "包包類",
      slug: "包包類",
      children: [
        { name: "正牌真皮包", slug: "正牌真皮包" },
        { name: "皮夾 / 零錢包", slug: "皮夾-零錢包" },
      ],
    },
    {
      name: "飾品美妝",
      slug: "飾品美妝",
      children: [
        { name: "首飾 / 髮飾", slug: "首飾-髮飾" },
        { name: "美妝洗護", slug: "美妝洗護" },
        { name: "香皂 / 香水 / 香氛", slug: "香皂-香水-香氛" },
      ],
    },
    {
      name: "生活雜項",
      slug: "生活雜項",
      children: [
        { name: "口罩", slug: "口罩" },
        { name: "文具", slug: "文具" },
        { name: "樂器", slug: "樂器" },
        { name: "兒童教具", slug: "兒童教具" },
        { name: "玩具 / 棋牌", slug: "玩具-棋牌" },
        { name: "DIY用品（串珠、毛線）", slug: "diy用品-串珠-毛線" },
        { name: "節慶裝飾", slug: "節慶裝飾" },
      ],
    },
    {
      name: "收藏小物",
      slug: "收藏小物",
      children: [
        { name: "鑰匙圈", slug: "鑰匙圈" },
        { name: "吊飾", slug: "吊飾" },
        { name: "磁貼", slug: "磁貼" },
        { name: "玩偶", slug: "玩偶" },
        { name: "動漫", slug: "動漫" },
      ],
    },
    {
      name: "穿搭配件",
      slug: "穿搭配件",
      children: [
        { name: "圍巾", slug: "圍巾" },
        { name: "手套", slug: "手套" },
        { name: "帽子", slug: "帽子" },
        { name: "鞋子", slug: "鞋子" },
        { name: "襪子", slug: "襪子" },
      ],
    },
    {
      name: "工具類",
      slug: "工具類",
      children: [
        { name: "五金用品", slug: "五金用品" },
        { name: "延長線", slug: "延長線" },
      ],
    },
    {
      name: "戶外生活",
      slug: "戶外生活",
      children: [
        { name: "戶外運動", slug: "戶外運動" },
        { name: "健身", slug: "健身" },
        { name: "按摩", slug: "按摩" },
        { name: "園藝", slug: "園藝" },
        { name: "寵物", slug: "寵物" },
      ],
    },
  ];

  const parentCategories = [];
  for (let i = 0; i < categoryTree.length; i += 1) {
    const parent = categoryTree[i];
    const createdParent = await upsertCategory({
      name: parent.name,
      slug: parent.slug || slugify(parent.name),
      parentId: null,
      sortOrder: i,
    });
    parentCategories.push({ ...createdParent, children: parent.children ?? [] });
  }

  for (const parent of parentCategories) {
    const children = parent.children ?? [];
    for (let j = 0; j < children.length; j += 1) {
      const child = children[j];
      await upsertCategory({
        name: child.name,
        slug: child.slug || slugify(child.name),
        parentId: parent.id,
        sortOrder: j,
      });
    }
  }

  const tagPopular = await prisma.tag.upsert({
    where: { slug: "popular" },
    create: { name: "熱門", slug: "popular" },
    update: { name: "熱門" },
  });
  const tagOnSale = await prisma.tag.upsert({
    where: { slug: "on-sale" },
    create: { name: "特價", slug: "on-sale" },
    update: { name: "特價" },
  });

  const kitchenware = await prisma.category.findUnique({ where: { slug: "廚房用具" } });
  const bags = await prisma.category.findUnique({ where: { slug: "包包類" } });
  const clothing = await prisma.category.findUnique({ where: { slug: "衣服" } });

  const demoProducts = [
    {
      name: "溫潤陶瓷杯",
      slug: "溫潤陶瓷杯",
      description: "自然光拍攝的陶瓷杯，色澤溫潤。適合每天的咖啡時間。",
      wearNotes: "杯口有輕微使用痕跡，不影響使用。",
      condition: ProductCondition.USED,
      priceCents: 18000,
      categoryId: kitchenware?.id,
      imageUrls: ["/demo/mug.svg"],
      tagIds: [tagPopular.id],
      quantity: 3,
    },
    {
      name: "真皮迷你小包",
      slug: "真皮迷你小包",
      description: "小巧真皮包，容量剛好放手機與錢包。",
      wearNotes: "皮面自然使用紋理，無明顯破損。",
      condition: ProductCondition.USED,
      priceCents: 68000,
      categoryId: bags?.id,
      imageUrls: ["/demo/leather-bag.svg"],
      tagIds: [tagOnSale.id],
      quantity: 1,
    },
    {
      name: "柔軟針織圍巾（全新）",
      slug: "柔軟針織圍巾-全新",
      description: "柔軟針織圍巾，保暖不刺膚。",
      wearNotes: "全新未使用。",
      condition: ProductCondition.NEW,
      priceCents: 25000,
      categoryId: clothing?.id,
      imageUrls: ["/demo/scarf.svg"],
      tagIds: [tagPopular.id, tagOnSale.id],
      quantity: 5,
    },
  ];

  for (const p of demoProducts) {
    if (!p.categoryId) continue;
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        wearNotes: p.wearNotes,
        condition: p.condition,
        priceCents: p.priceCents,
        categoryId: p.categoryId,
        images: {
          create: p.imageUrls.map((url, idx) => ({ url, sortOrder: idx })),
        },
        inventory: { create: { quantity: p.quantity } },
        tags: { create: p.tagIds.map((tagId) => ({ tagId })) },
      },
      update: {
        priceCents: p.priceCents,
        isActive: true,
      },
    });

    // Ensure inventory exists
    await prisma.inventory.upsert({
      where: { productId: product.id },
      create: { productId: product.id, quantity: p.quantity },
      update: { quantity: p.quantity },
    });
  }

  console.log("Seed complete.");
  console.log(`Admin login: ${adminEmail} / ${adminPassword}`);
  console.log("Demo images expected under /public/demo (added in repo).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

