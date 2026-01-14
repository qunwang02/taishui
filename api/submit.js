import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req, res) {
  // 确保始终返回JSON
  res.setHeader('Content-Type', 'application/json');
  
  cors(res);
  if (req.method === "OPTIONS") {
    return res.status(200).json({ ok: true });
  }
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    if (!process.env.NOTION_API_KEY) {
      return res.status(500).json({ ok: false, error: "环境变量 NOTION_API_KEY 未设置" });
    }
    
    if (!DATABASE_ID) {
      return res.status(500).json({ ok: false, error: "环境变量 NOTION_DATABASE_ID 未设置" });
    }

    const {
      title, zodiac, "护持金额台币": amountNTD, 人民币: amountCNY, 联系人: contact
    } = req.body || {};

    if (!title) return res.status(400).json({ ok: false, error: "缺少必填字段：姓名（标题）" });
    if (!zodiac) return res.status(400).json({ ok: false, error: "缺少必填字段：生肖" });
    if (!contact) return res.status(400).json({ ok: false, error: "缺少必填字段：联系人" });

    const properties = {
      "姓名": { title: [{ type: "text", text: { content: String(title) } }] },
      "生肖": { rich_text: [{ type: "text", text: { content: String(zodiac) } }] },
      "护持金额台币": Number.isFinite(amountNTD) ? { number: Number(amountNTD) } : { number: 0 },
      "人民币": Number.isFinite(amountCNY) ? { number: Number(amountCNY) } : { number: 0 },
      "联系人": { rich_text: [{ type: "text", text: { content: String(contact) } }] }
    };

    const resp = await notion.pages.create({
      parent: { database_id: DATABASE_ID },
      properties
    });

    return res.status(200).json({ ok: true, pageId: resp.id });
  } catch (e) {
    console.error("submit error:", e);
    // 确保返回JSON格式错误
    return res.status(500).json({
      ok: false,
      error: "提交数据失败",
      details: String(e).substring(0, 100) // 只返回前100个字符，避免HTML内容
    });
  }
}
