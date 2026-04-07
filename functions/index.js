// pennylane proxy v4 - 2026-04-08 - token I43Vf
const functions = require('firebase-functions');
const https = require('https');
const admin = require('firebase-admin');

admin.initializeApp();

function pennylaneRequest(token, method, path, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: 'app.pennylane.com',
      path: `/api/external/v2/${path}`,
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {})
      }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch(e) { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

const ALLOWED = [
  'customer_invoices', 'supplier_invoices', 'transactions',
  'bank_accounts', 'customers', 'suppliers', 'categories'
];

exports.pennylane = functions
  .region('europe-west1')
  .https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', 'https://i-immersion.github.io');
    res.set('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
    if (!['GET', 'PUT'].includes(req.method)) {
      res.status(405).json({ error: 'M\u00e9thode non support\u00e9e' }); return;
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Non authentifi\u00e9' }); return;
    }
    try {
      await admin.auth().verifyIdToken(authHeader.split('Bearer ')[1]);
    } catch(e) {
      res.status(401).json({ error: 'Token invalide' }); return;
    }

    const pennylaneToken = process.env.PENNYLANE_TOKEN;
    if (!pennylaneToken) { res.status(500).json({ error: 'Token Pennylane manquant' }); return; }

    // Routing : /bank_accounts ou ?endpoint=bank_accounts
    const rawQuery = req.url.includes('?') ? req.url.split('?')[1] : '';
    const params = new URLSearchParams(rawQuery);
    const pathSegment = req.path.replace(/^\//, '');
    const endpoint = pathSegment || params.get('endpoint');

    if (!endpoint || !ALLOWED.some(e => endpoint.startsWith(e))) {
      res.status(400).json({ error: 'Endpoint non autoris\u00e9' }); return;
    }

    params.delete('endpoint');
    const queryStr = params.toString();
    const plPath = queryStr ? `${endpoint}?${queryStr}` : endpoint;

    try {
      const result = await pennylaneRequest(pennylaneToken, req.method, plPath, req.body);
      res.status(result.status).json(result.body);
    } catch(e) {
      res.status(500).json({ error: e.message });
    }
  });
