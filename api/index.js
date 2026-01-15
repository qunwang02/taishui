// api/index.js
import health from './health.js';
import submit from './submit.js';
import data from './data.js';
import deleteHandler from './delete.js'; // 新增删除路由

export default async function handler(req, res) {
  const path = req.url.split('/').pop().split('?')[0];
  
  console.log("📡 API请求路径:", path);
  
  if (path === 'health') {
    return health(req, res);
  } else if (path === 'submit') {
    return submit(req, res);
  } else if (path === 'data') {
    return data(req, res);
  } else if (path === 'delete') {  // 新增删除路由
    return deleteHandler(req, res);
  } else {
    res.status(404).json({ 
      ok: false,
      error: 'API端点不存在' 
    });
  }
}
