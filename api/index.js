import health from './health.js';
import submit from './submit.js';
import getData from './getData.js';
import deleteData from './deleteData.js';

export default async function handler(req, res) {
  const path = req.url.split('/').pop().split('?')[0];
  
  if (path === 'health') {
    return health(req, res);
  } else if (path === 'submit') {
    return submit(req, res);
  } else if (path === 'getData') {
    return getData(req, res);
  } else if (path === 'deleteData') {
    return deleteData(req, res);
  } else {
    res.status(404).json({ error: 'Not Found' });
  }
}
