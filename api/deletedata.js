import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "DELETE") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    const { id } = req.body || {};
    
    if (!id) {
      return res.status(400).json({ error: "缺少必填字段：id" });
    }

    await notion.pages.update({
      page_id: id,
      archived: true
    });

    return res.status(200).json({ ok: true, message: "删除成功" });
  } catch (e) {
    const msg = e?.body?.message || e.message || String(e);
    return res.status(500).json({ error: msg });
  }
}
