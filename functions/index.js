const functions = require('firebase-functions');
const https = require('https');

function pennylaneGet(token, endpoint) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'app.pennylane.com',
      path: `/api/external/v2/${endpoint}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch(e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

const ALLOWED = [
  'customer_invoices',
  'supplier_invoices',
  'transactions',
  'bank_accounts',
  'customers',
  'suppliers',
  'categories'
];

exports.pennylane = functions
  .region('europe-west1')
  .https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', 'https://i-immersion.github.io');
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    const token = process.env.PENNYLANE_TOKEN;

    if (!token) {
      res.status(500).json({ error: 'Token Pennylane manquant' });
      return;
    }

    // Supporte les deux formats :
    // - /pennylane/customer_invoices?limit=10  (path routing)
    // - /pennylane?endpoint=customer_invoices  (query param)
    const pathSegment = req.path.replace(/^\//, ''); // retire le / initial
    const endpoint = pathSegment || req.query.endpoint;

    if (!endpoint || !ALLOWED.some(e => endpoint.startsWith(e))) {
      res.status(400).json({ error: 'Endpoint non autoris\u00e9' });
      return;
    }

    // Passe tous les query params sauf endpoint
    const params = new URLSearchParams(req.query);
    params.delete('endpoint');
    const path = params.toString() ? `${endpoint}?${params}` : endpoint;

    try {
      const result = await pennylaneGet(token, path);
      res.status(result.status).json(result.body);
    } catch(e) {
      res.status(500).json({ error: e.message });
    }
  });
