import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    if (!DATABASE_ID) {
      return res.status(400).json({ ok: false, error: "缺少环境变量 NOTION_DATABASE_ID" });
    }

    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      sorts: [{ timestamp: "created_time", direction: "descending" }]
    });

    const records = response.results.map(page => {
      const properties = page.properties;
      
      // 读取新版字段名 "护持金额"
      const amountVal = properties["护持金额"]?.number || 0;
      
      return {
        id: page.id,
        name: properties["姓名"]?.title?.[0]?.text?.content || "未知",
        zodiac: properties["生肖"]?.rich_text?.[0]?.text?.content || "未知",
        amountCNY: amountVal, 
        amountNTD: amountVal, // 为了兼容原来的前端变量名，依然返回此字段
        contact: properties["联系人"]?.rich_text?.[0]?.text?.content || "未知",
        created_time: page.created_time,
        created_at: new Date(page.created_time).toLocaleString('zh-CN'),
        timestamp: new Date(page.created_time).getTime(),
        url: page.url
      };
    });

    return res.status(200).json({
      ok: true,
      count: records.length,
      data: records,
      last_updated: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("查询失败:", error);
    return res.status(error.status || 500).json({
      ok: false,
      error: error.body?.message || error.message || String(error)
    });
  }
}