import health from './health.js';
import submit from './submit.js';
import getData from './getData.js';
import deleteData from './deleteData.js';

export default async function handler(req, res) {
  // 提取API路径，去掉/api/前缀
  const apiPath = req.url.replace('/api/', '').split('?')[0];
  
  if (apiPath === 'health') {
    return health(req, res);
  } else if (apiPath === 'submit') {
    return submit(req, res);
  } else if (apiPath === 'getData') {
    return getData(req, res);
  } else if (apiPath === 'deleteData') {
    return deleteData(req, res);
  } else {
    res.status(404).json({ error: 'Not Found' });
  }
}
