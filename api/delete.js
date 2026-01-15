// api/delete.js - 删除Notion数据库中的记录
import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req, res) {
  cors(res);
  
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  
  if (req.method !== "DELETE") {
    return res.status(405).json({ 
      ok: false,
      error: "Method Not Allowed" 
    });
  }

  try {
    // 解析请求体
    let body;
    try {
      body = req.body ? JSON.parse(req.body) : {};
    } catch (e) {
      body = req.body || {};
    }
    
    const { id, pageId } = body;
    
    // 使用 pageId 或 id
    const page_id = pageId || id;
    
    if (!page_id) {
      return res.status(400).json({ 
        ok: false, 
        error: "缺少页面ID (pageId或id)" 
      });
    }
    
    console.log("正在归档Notion页面:", page_id);
    
    // 在Notion中，"删除"实际上是归档页面
    const response = await notion.pages.update({
      page_id: page_id,
      archived: true,  // 设置为true表示归档（删除）
      properties: {}   // 可以保持空对象
    });
    
    console.log("页面归档成功:", page_id);
    
    return res.status(200).json({
      ok: true,
      message: "记录已成功归档（删除）",
      pageId: page_id,
      archived: true,
      notionResponse: {
        id: response.id,
        archived: response.archived,
        url: response.url
      }
    });
    
  } catch (error) {
    console.error("归档Notion页面失败:", error);
    
    // 提供更详细的错误信息
    let errorMessage = "未知错误";
    let errorCode = 500;
    
    if (error.message) {
      errorMessage = error.message;
    }
    
    if (error.body && error.body.message) {
      errorMessage = error.body.message;
    }
    
    if (error.status) {
      errorCode = error.status;
    }
    
    // 常见错误处理
    if (errorMessage.includes("rate limited")) {
      errorMessage = "API请求频率受限，请稍后重试";
      errorCode = 429;
    } else if (errorMessage.includes("validation error")) {
      errorMessage = "页面ID格式错误";
      errorCode = 400;
    } else if (errorMessage.includes("Could not find")) {
      errorMessage = "未找到该页面，可能已被删除";
      errorCode = 404;
    }
    
    return res.status(errorCode).json({
      ok: false,
      error: errorMessage,
      details: error.body || null
    });
  }
}
