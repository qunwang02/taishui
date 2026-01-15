// api/index.js
import health from './health.js';
import submit from './submit.js';
import data from './data.js'; // 新增

export default async function handler(req, res) {
  const path = req.url.split('/').pop().split('?')[0];
  
  console.log("API请求路径:", path);
  
  if (path === 'health') {
    return health(req, res);
  } else if (path === 'submit') {
    return submit(req, res);
  } else if (path === 'data') { // 新增数据API
    return data(req, res);
  } else {
    res.status(404).json({ error: 'Not Found' });
  }
}
