import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    const {
      title, zodiac, "护持金额台币": amountNTD, 人民币: amountCNY, 联系人: contact
    } = req.body || {};

    if (!title) return res.status(400).json({ error: "缺少必填字段：姓名（标题）" });
    if (!zodiac) return res.status(400).json({ error: "缺少必填字段：生肖" });
    if (!contact) return res.status(400).json({ error: "缺少必填字段：联系人" });

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
    const msg = e?.body?.message || e.message || String(e);
    return res.status(500).json({ error: msg });
  }
}

