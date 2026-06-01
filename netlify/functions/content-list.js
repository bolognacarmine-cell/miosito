const fs = require('fs');
const path = require('path');

const allowed = new Set(['prodotti', 'offerte', 'servizi']);

const readJsonSafe = (filePath) => {
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'Method not allowed' })
    };
  }

  const type = String(event.queryStringParameters?.type || '').trim().toLowerCase();
  if (!allowed.has(type)) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'Invalid type. Use: prodotti|offerte|servizi' })
    };
  }

  const dirPath = path.join(__dirname, '..', '..', 'content', type);

  let entries = [];
  try {
    entries = fs.readdirSync(dirPath, { withFileTypes: true });
  } catch (e) {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      },
      body: JSON.stringify({ ok: true, type, items: [] })
    };
  }

  const files = entries
    .filter((e) => e.isFile() && e.name.toLowerCase().endsWith('.json'))
    .map((e) => e.name);

  const items = [];
  for (const fileName of files) {
    const fullPath = path.join(dirPath, fileName);
    try {
      const stat = fs.statSync(fullPath);
      const data = readJsonSafe(fullPath);
      items.push({ ...data, _file: fileName, _mtime: stat.mtimeMs });
    } catch (e) {
    }
  }

  items.sort((a, b) => (b._mtime || 0) - (a._mtime || 0));

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    },
    body: JSON.stringify({ ok: true, type, items })
  };
};
