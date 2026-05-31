const axios = require('axios');
const querystring = require('querystring');
 
const getCookie = (cookieHeader, name) => {
  if (!cookieHeader) return '';
  const parts = String(cookieHeader).split(';').map(p => p.trim());
  const found = parts.find(p => p.startsWith(`${name}=`));
  if (!found) return '';
  return decodeURIComponent(found.substring(name.length + 1));
};
 
const encodeBase64Url = (obj) =>
  Buffer.from(JSON.stringify(obj))
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
 
exports.handler = async (event) => {
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  if (!appId || !appSecret) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Missing META_APP_ID or META_APP_SECRET env var on Netlify.'
    };
  }
 
  const redirectUri = process.env.META_REDIRECT_URI || 'https://pc-work.it/api/auth/meta/callback';
 
  const code = event.queryStringParameters?.code;
  const state = event.queryStringParameters?.state;
  const cookieState = getCookie(event.headers?.cookie || event.headers?.Cookie, 'meta_oauth_state');
  if (!code) {
    return { statusCode: 400, headers: { 'Content-Type': 'text/plain' }, body: 'Missing code.' };
  }
  if (!state || !cookieState || cookieState !== state) {
    return { statusCode: 400, headers: { 'Content-Type': 'text/plain' }, body: 'Invalid state.' };
  }
 
  try {
    const tokenRes = await axios.get('https://graph.facebook.com/v19.0/oauth/access_token', {
      params: {
        client_id: appId,
        redirect_uri: redirectUri,
        client_secret: appSecret,
        code
      },
      timeout: 15000
    });
 
    const shortToken = tokenRes.data.access_token;
 
    const longRes = await axios.get('https://graph.facebook.com/v19.0/oauth/access_token', {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: appId,
        client_secret: appSecret,
        fb_exchange_token: shortToken
      },
      timeout: 15000
    });
 
    const longToken = longRes.data.access_token;
    const expiresIn = longRes.data.expires_in;
 
    const accountsRes = await axios.get('https://graph.facebook.com/v19.0/me/accounts', {
      params: {
        fields: 'id,name,access_token,instagram_business_account',
        access_token: longToken
      },
      timeout: 15000
    });
 
    const pages = Array.isArray(accountsRes.data?.data) ? accountsRes.data.data : [];
    const preferredPageId =
      process.env.FACEBOOK_PAGE_ID ||
      process.env.FACEBOOK_PAGE_ID_FALLBACK ||
      event.queryStringParameters?.page_id ||
      '';
 
    let page = preferredPageId ? pages.find(p => String(p?.id) === String(preferredPageId)) : null;
    if (!page) page = pages[0] || null;
 
    const pageId = page?.id || '';
    const pageName = page?.name || '';
    const pageAccessToken = page?.access_token || '';
    let igBusinessId = page?.instagram_business_account?.id || '';
 
    if (!igBusinessId && pageId && pageAccessToken) {
      const pageRes = await axios.get(`https://graph.facebook.com/v19.0/${pageId}`, {
        params: {
          fields: 'instagram_business_account{id,username}',
          access_token: pageAccessToken
        },
        timeout: 15000
      });
      igBusinessId = pageRes.data?.instagram_business_account?.id || '';
    }
 
    const payload = {
      ok: true,
      expires_in: expiresIn,
      page: { id: pageId, name: pageName },
      instagram: { ig_user_id: igBusinessId },
      tokens: {
        page_access_token: pageAccessToken
      }
    };
 
    return {
      statusCode: 302,
      headers: {
        Location: `https://pc-work.it/pages/social-dashboard.html?connected=1#ig=${encodeURIComponent(encodeBase64Url(payload))}`,
        'Set-Cookie': 'meta_oauth_state=; Path=/; Max-Age=0; Secure; HttpOnly; SameSite=Lax'
      },
      body: ''
    };
  } catch (e) {
    const msg = e.response?.data?.error?.message || e.response?.data || e.message;
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/plain' },
      body: `OAuth error: ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`
    };
  }
};
