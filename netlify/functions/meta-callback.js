const axios = require('axios');
const querystring = require('querystring');
 
const getBaseUrl = () => {
  const baseUrl = process.env.DEPLOY_PRIME_URL || process.env.DEPLOY_URL || process.env.URL;
  return String(baseUrl || '').replace(/\/+$/, '');
};
 
const getCookie = (cookieHeader, name) => {
  if (!cookieHeader) return '';
  const parts = String(cookieHeader).split(';').map(p => p.trim());
  const found = parts.find(p => p.startsWith(`${name}=`));
  if (!found) return '';
  return decodeURIComponent(found.substring(name.length + 1));
};
 
const escapeHtml = (str) =>
  String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
 
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
 
  const baseUrl = getBaseUrl();
  const redirectUri = `${baseUrl}/api/auth/meta/callback`;
 
  const code = event.queryStringParameters?.code;
  const state = event.queryStringParameters?.state;
  const cookieState = getCookie(event.headers?.cookie || event.headers?.Cookie, 'meta_oauth_state');
  if (!code) {
    return { statusCode: 400, headers: { 'Content-Type': 'text/plain' }, body: 'Missing code.' };
  }
  if (cookieState && state && cookieState !== state) {
    return { statusCode: 400, headers: { 'Content-Type': 'text/plain' }, body: 'Invalid state.' };
  }
 
  try {
    const tokenRes = await axios.get('https://graph.facebook.com/v20.0/oauth/access_token', {
      params: {
        client_id: appId,
        redirect_uri: redirectUri,
        client_secret: appSecret,
        code
      },
      timeout: 15000
    });
 
    const shortToken = tokenRes.data.access_token;
 
    const longRes = await axios.get('https://graph.facebook.com/v20.0/oauth/access_token', {
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
 
    const accountsRes = await axios.get('https://graph.facebook.com/v20.0/me/accounts', {
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
      const pageRes = await axios.get(`https://graph.facebook.com/v20.0/${pageId}`, {
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
 
    const html = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Instagram collegato</title>
  <style>
    body{font-family:Arial, sans-serif; padding:24px; max-width:720px; margin:0 auto; line-height:1.4}
    code{background:#f4f4f4; padding:2px 6px; border-radius:4px}
    .ok{color:#0a7d2a; font-weight:700}
    .warn{color:#8a3b00; font-weight:700}
    textarea{width:100%; min-height:120px}
    button{padding:10px 14px; cursor:pointer}
  </style>
</head>
<body>
  <h2 class="ok">Collegamento Instagram completato</h2>
  <p>Ora puoi tornare alla Social Dashboard. I dati sono stati salvati nel browser (localStorage) per fare un post di test.</p>
  <p><span class="warn">Nota:</span> per la pubblicazione automatica durante i deploy, devi comunque copiare il token su Netlify come <code>INSTAGRAM_ACCESS_TOKEN</code> e l’ID come <code>INSTAGRAM_IG_USER_ID</code>.</p>
  <h3>Dati ottenuti</h3>
  <pre>${escapeHtml(JSON.stringify(payload, null, 2))}</pre>
  <button id="closeBtn">Torna alla Dashboard</button>
  <script>
    (function(){
      var data = ${JSON.stringify(payload)};
      if (data && data.ok) {
        if (data.tokens && data.tokens.page_access_token) {
          localStorage.setItem('ig_access_token', data.tokens.page_access_token);
        }
        if (data.instagram && data.instagram.ig_user_id) {
          localStorage.setItem('ig_user_id', data.instagram.ig_user_id);
        }
        if (data.page && data.page.id) {
          localStorage.setItem('ig_page_id', data.page.id);
        }
        if (data.expires_in) {
          localStorage.setItem('ig_expires_in', String(data.expires_in));
          localStorage.setItem('ig_saved_at', String(Date.now()));
        }
        if (window.opener && window.opener.postMessage) {
          window.opener.postMessage({ type: 'ig_oauth_complete', data: data }, '*');
        }
      }
      document.getElementById('closeBtn').addEventListener('click', function(){
        window.location.href = '/pages/social-dashboard.html';
      });
    })();
  </script>
</body>
</html>`;
 
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Set-Cookie': 'meta_oauth_state=; Path=/; Max-Age=0; Secure; SameSite=Lax'
      },
      body: html
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
