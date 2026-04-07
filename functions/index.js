const functions = require('firebase-functions');
const https = require('https');
const admin = require('firebase-admin');

admin.initializeApp();

function pennylaneGet(token, path) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'app.pennylane.com',
      path: `/api/external/v2/${path}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch(e) { reject(e); }
      });
    });
    req.on('error', reject);
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
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') { res.status(204).send(''); return; }

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

    // Utiliser la query string brute pour préserver les filtres JSON complexes
    const rawQuery = req.url.includes('?') ? req.url.split('?')[1] : '';
    const params = new URLSearchParams(rawQuery);

    const endpoint = params.get('endpoint');
    if (!endpoint || !ALLOWED.some(e => endpoint.startsWith(e))) {
      res.status(400).json({ error: 'Endpoint non autoris\u00e9' }); return;
    }

    params.delete('endpoint');
    const queryStr = params.toString();
    const path = queryStr ? `${endpoint}?${queryStr}` : endpoint;

    try {
      const result = await pennylaneGet(pennylaneToken, path);
      res.status(result.status).json(result.body);
    } catch(e) {
      res.status(500).json({ error: e.message });
    }
  });
