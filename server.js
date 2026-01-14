import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import handler from './api/index.js';

// 设置环境变量
process.env.NOTION_API_KEY = process.env.NOTION_API_KEY || ;
process.env.NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID || ;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PORT = process.env.PORT || 3000;

const server = createServer(async (req, res) => {
  // 处理API请求
  if (req.url.startsWith('/api/')) {
    await handler(req, res);
    return;
  }

  // 处理静态文件
  const staticPath = join(__dirname, 'dist');
  let filePath = join(staticPath, req.url === '/' ? 'index.html' : req.url);

  // 简单的静态文件服务实现
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.end('<!DOCTYPE html><html><head><title>Server</title></head><body><h1>Server is running</h1></body></html>');
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
