const fs = require('fs');
const path = require('path');
const axios = require('axios');

const allowed = new Set(['prodotti', 'offerte', 'servizi']);
const owner = 'bolognacarmine-cell';
const repo = 'miosito';

const readJsonSafe = (filePath) => {
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
};

const fetchFromGitHub = async (type) => {
  try {
    const listRes = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/contents/content/${type}`,
      {
        params: { t: Date.now() },
        headers: {
          'User-Agent': 'pc-work',
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache'
        },
        timeout: 15000
      }
    );

    const files = Array.isArray(listRes.data)
      ? listRes.data.filter((f) => String(f?.name || '').toLowerCase().endsWith('.json'))
      : [];

    const items = [];
    for (const file of files) {
      if (!file?.download_url) continue;
      try {
        const itemRes = await axios.get(file.download_url, {
          params: { t: Date.now() },
          headers: {
            'User-Agent': 'pc-work',
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache'
          },
          timeout: 15000
        });
        items.push({ ...itemRes.data, _file: file.name });
      } catch (e) {
      }
    }

    return items;
  } catch (e) {
    return [];
  }
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
    const items = await fetchFromGitHub(type);
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      },
      body: JSON.stringify({ ok: true, type, items })
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
