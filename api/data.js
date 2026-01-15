// api/data.js
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
  
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // 验证数据库ID
    if (!DATABASE_ID) {
      return res.status(400).json({ 
        ok: false, 
        error: "缺少环境变量 NOTION_DATABASE_ID" 
      });
    }

    console.log("正在查询Notion数据库:", DATABASE_ID);

    // 查询数据库中的所有记录
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      sorts: [
        {
          timestamp: "created_time",
          direction: "descending"
        }
      ]
    });

    console.log("查询成功，找到", response.results.length, "条记录");

    // 转换数据格式
    const records = response.results.map(page => {
      const properties = page.properties;
      const createdTime = new Date(page.created_time);
      
      return {
        id: page.id,
        name: properties["姓名"]?.title?.[0]?.text?.content || "未知",
        zodiac: properties["生肖"]?.rich_text?.[0]?.text?.content || "未知",
        amountNTD: properties["护持金额台币"]?.number || 0,
        amountCNY: properties["人民币"]?.number || 0,
        contact: properties["联系人"]?.rich_text?.[0]?.text?.content || "未知",
        created_time: page.created_time,
        created_at: createdTime.toLocaleString('zh-CN'),
        timestamp: createdTime.getTime(),
        url: page.url || `https://notion.so/${page.id.replace(/-/g, '')}`
      };
    });

    // 计算统计信息
    const stats = {
      total: records.length,
      totalNTD: records.reduce((sum, record) => sum + (record.amountNTD || 0), 0),
      totalCNY: records.reduce((sum, record) => sum + (record.amountCNY || 0), 0)
    };

    return res.status(200).json({
      ok: true,
      stats: stats,
      count: records.length,
      data: records,
      last_updated: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("查询Notion数据库失败:", error);
    
    const errorMessage = error.body?.message || error.message || String(error);
    const errorCode = error.status || 500;
    
    return res.status(errorCode).json({
      ok: false,
      error: errorMessage,
      details: error.body || null
    });
  }
}
