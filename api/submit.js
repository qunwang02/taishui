import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  cors(res);
  
  if (req.method === "OPTIONS") return res.status(200).json({ ok: true });
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method Not Allowed" });

  try {
    if (!process.env.NOTION_API_KEY || !DATABASE_ID) {
      return res.status(500).json({ ok: false, error: "环境变量未设置" });
    }

    // 注意：前端虽然传了 护持金额台币，但我们现在直接取人民币金额
    const {
      title, 
      zodiac, 
      "护持金额台币": amountCNY_legacy, // 兼容前端传参
      人民币: amountCNY, 
      联系人: contact
    } = req.body || {};

    // 优先取 人民币 字段，取不到则取兼容字段
    const finalAmount = amountCNY !== undefined ? amountCNY : (amountCNY_legacy || 0);

    if (!title) return res.status(400).json({ ok: false, error: "缺少必填字段：姓名" });
    if (!zodiac) return res.status(400).json({ ok: false, error: "缺少必填字段：生肖/说明" });
    if (!contact) return res.status(400).json({ ok: false, error: "缺少必填字段：联系人" });

    const properties = {
      "姓名": { title: [{ type: "text", text: { content: String(title) } }] },
      "生肖": { rich_text: [{ type: "text", text: { content: String(zodiac) } }] },
      "护持金额": { number: Number(finalAmount) }, // 写入新的列名
      "人民币": { number: Number(finalAmount) },   // 同步写入
      "联系人": { rich_text: [{ type: "text", text: { content: String(contact) } }] }
    };

    const resp = await notion.pages.create({
      parent: { database_id: DATABASE_ID },
      properties
    });

    return res.status(200).json({ ok: true, pageId: resp.id });
  } catch (e) {
    console.error("submit error:", e);
    return res.status(500).json({
      ok: false,
      error: "提交数据失败",
      details: String(e).substring(0, 100)
    });
  }
}