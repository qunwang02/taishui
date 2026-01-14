import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req, res) {
  // 确保始终返回JSON
  res.setHeader('Content-Type', 'application/json');
  
  cors(res);
  if (req.method === "OPTIONS") {
    return res.status(200).json({ ok: true });
  }
  if (req.method !== "DELETE") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    if (!process.env.NOTION_API_KEY) {
      return res.status(500).json({ ok: false, error: "环境变量 NOTION_API_KEY 未设置" });
    }
    
    const { id } = req.body || {};
    
    if (!id) {
      return res.status(400).json({ ok: false, error: "缺少必填字段：id" });
    }

    await notion.pages.update({
      page_id: id,
      archived: true
    });

    return res.status(200).json({ ok: true, message: "删除成功" });
  } catch (e) {
    console.error("deleteData error:", e);
    // 确保返回JSON格式错误
    return res.status(500).json({
      ok: false,
      error: "删除数据失败",
      details: String(e).substring(0, 100) // 只返回前100个字符，避免HTML内容
    });
  }
}
