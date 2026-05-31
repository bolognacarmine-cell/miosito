const crypto = require('crypto');
const querystring = require('querystring');
 
const getBaseUrl = () => {
  const baseUrl = process.env.DEPLOY_PRIME_URL || process.env.DEPLOY_URL || process.env.URL;
  return String(baseUrl || '').replace(/\/+$/, '');
};
 
exports.handler = async (event) => {
  const appId = process.env.META_APP_ID;
  if (!appId) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'Missing META_APP_ID env var' })
    };
  }
 
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'Missing site base URL (URL/DEPLOY_URL/DEPLOY_PRIME_URL)' })
    };
  }
 
  const redirectUri = `${baseUrl}/api/auth/meta/callback`;
  const state = crypto.randomBytes(16).toString('hex');
 
  const scope = [
    'pages_show_list',
    'pages_read_engagement',
    'instagram_basic',
    'instagram_content_publish'
  ].join(',');
 
  const qs = querystring.stringify({
    client_id: appId,
    redirect_uri: redirectUri,
    state,
    scope,
    response_type: 'code'
  });
 
  return {
    statusCode: 302,
    headers: {
      Location: `https://www.facebook.com/v20.0/dialog/oauth?${qs}`,
      'Set-Cookie': `meta_oauth_state=${state}; Path=/; Max-Age=600; Secure; SameSite=Lax`
    },
    body: ''
  };
};
