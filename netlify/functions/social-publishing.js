const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { publishPromotion } = require('./social-publisher');

const readSocialSettings = async () => {
  try {
    const settingsPath = path.join(__dirname, '..', '..', 'content', 'social_settings.json');
    const raw = fs.readFileSync(settingsPath, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    try {
      const baseUrl = process.env.DEPLOY_PRIME_URL || process.env.DEPLOY_URL || process.env.URL;
      if (!baseUrl) throw new Error('Missing baseUrl');
      const url = `${String(baseUrl).replace(/\/+$/, '')}/content/social_settings.json`;
      const res = await axios.get(url, { timeout: 5000 });
      return res.data;
    } catch (e2) {
      return {
        enabled: true,
        platforms: [
          { name: 'Facebook', enabled: true },
          { name: 'Instagram', enabled: true },
          { name: 'Telegram', enabled: false }
        ]
      };
    }
  }
};

const isPlatformEnabled = (socialSettings, platformName) => {
  if (socialSettings && socialSettings.enabled === false) return false;
  const list = Array.isArray(socialSettings?.platforms) ? socialSettings.platforms : [];
  const found = list.find(
    (p) => String(p?.name || '').toLowerCase() === String(platformName || '').toLowerCase()
  );
  if (!found) return false;
  return found.enabled !== false;
};

const parseBody = (event) => {
  if (!event || !event.body) return {};
  const raw = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, x-social-publish-secret',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        ok: true,
        message: 'Usa POST con JSON per pubblicare. Richiede header x-social-publish-secret.',
        example: {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-social-publish-secret': '...' },
          body: { title: 'Titolo', body: 'Testo', platforms: ['Facebook'] }
        }
      })
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ ok: false, error: 'Method not allowed' })
    };
  }

  const expectedSecret = process.env.SOCIAL_PUBLISH_SECRET;
  const providedSecret = event.headers?.['x-social-publish-secret'] || event.headers?.['X-Social-Publish-Secret'];
  if (!expectedSecret || providedSecret !== expectedSecret) {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        ok: false,
        error: 'Unauthorized',
        hint: 'Imposta SOCIAL_PUBLISH_SECRET su Netlify e invia l’header x-social-publish-secret.'
      })
    };
  }

  const payload = parseBody(event);
  const title = String(payload.title || '').trim();
  const body = String(payload.body || payload.message || '').trim();
  const imageUrl = String(payload.imageUrl || '').trim();
  const platforms = Array.isArray(payload.platforms) ? payload.platforms : Array.isArray(payload.social_platforms) ? payload.social_platforms : ['Facebook'];

  if (!title && !body) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ ok: false, error: 'Missing content (title/body/message)' })
    };
  }

  const socialSettings = await readSocialSettings();
  const enabledPlatforms = platforms.filter((p) => isPlatformEnabled(socialSettings, p));
  if (enabledPlatforms.length === 0) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ ok: false, error: 'No enabled platforms', platforms })
    };
  }

  const content = title && body ? `${title}\n\n${body}` : (title || body);
  const caption = title || content.substring(0, 80);

  try {
    await publishPromotion(content, imageUrl, caption, enabledPlatforms);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ ok: true, publishedTo: enabledPlatforms })
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ ok: false, error: e.message })
    };
  }
};
