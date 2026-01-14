import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req, res) {
  // 确保始终返回JSON
  res.setHeader('Content-Type', 'application/json');
  
  cors(res);
  if (req.method === "OPTIONS") {
    return res.status(200).json({ ok: true });
  }
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    if (!process.env.NOTION_API_KEY) {
      return res.status(500).json({ ok: false, error: "环境变量 NOTION_API_KEY 未设置" });
    }
    
    if (!DATABASE_ID) {
      return res.status(500).json({ ok: false, error: "环境变量 NOTION_DATABASE_ID 未设置" });
    }

    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      sorts: [
        {
          property: "created_time",
          direction: "descending"
        }
      ]
    });

    const results = response.results.map(page => {
      const { properties, id } = page;
      return {
        id,
        name: properties["姓名"].title[0]?.plain_text || "",
        zodiac: properties["生肖"].rich_text[0]?.plain_text || "",
        amountNTD: properties["护持金额台币"].number || 0,
        amountCNY: properties["人民币"].number || 0,
        contact: properties["联系人"].rich_text[0]?.plain_text || ""
      };
    });

    return res.status(200).json({ ok: true, data: results });
  } catch (e) {
    console.error("getData error:", e);
    // 确保返回JSON格式错误
    return res.status(500).json({
      ok: false,
      error: "获取数据失败",
      details: String(e).substring(0, 100) // 只返回前100个字符，避免HTML内容
    });
  }
}
