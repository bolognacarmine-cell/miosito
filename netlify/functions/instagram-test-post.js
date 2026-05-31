const axios = require('axios');
 
const getBaseUrl = () => {
  const baseUrl = process.env.DEPLOY_PRIME_URL || process.env.DEPLOY_URL || process.env.URL;
  return String(baseUrl || '').replace(/\/+$/, '');
};
 
const parseBody = (event) => {
  if (!event || !event.body) return {};
  const raw = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body;
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
};
 
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST,OPTIONS'
      },
      body: ''
    };
  }
 
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: false, error: 'Method not allowed' }) };
  }
 
  const payload = parseBody(event);
  const accessToken = String(payload.access_token || '').trim();
  const igUserId = String(payload.ig_user_id || '').trim();
  let imageUrl = String(payload.image_url || '').trim();
  const caption = String(payload.caption || 'Test Instagram da Social Dashboard').trim();
 
  if (!accessToken || !igUserId) {
    return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: false, error: 'Missing access_token or ig_user_id' }) };
  }
 
  if (!imageUrl) {
    const baseUrl = getBaseUrl();
    if (!baseUrl) {
      return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: false, error: 'Missing image_url' }) };
    }
    imageUrl = `${baseUrl}/images/uploads/riparazione.jpg`;
  }
 
  if (imageUrl.startsWith('/')) {
    const baseUrl = getBaseUrl();
    imageUrl = `${baseUrl}${imageUrl}`;
  }
 
  try {
    const containerRes = await axios.post(`https://graph.facebook.com/v20.0/${igUserId}/media`, null, {
      params: {
        image_url: imageUrl,
        caption,
        access_token: accessToken
      },
      timeout: 20000
    });
 
    const creationId = containerRes.data?.id;
    if (!creationId) {
      return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: false, error: 'Missing creation id from Instagram' }) };
    }
 
    const publishRes = await axios.post(`https://graph.facebook.com/v20.0/${igUserId}/media_publish`, null, {
      params: {
        creation_id: creationId,
        access_token: accessToken
      },
      timeout: 20000
    });
 
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ ok: true, creation_id: creationId, result: publishRes.data })
    };
  } catch (e) {
    const msg = e.response?.data?.error?.message || e.message;
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ ok: false, error: msg })
    };
  }
};
