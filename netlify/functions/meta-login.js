const crypto = require('crypto');
const querystring = require('querystring');
 
exports.handler = async (event) => {
  const appId = process.env.META_APP_ID;
  if (!appId) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'Missing META_APP_ID env var' })
    };
  }
 
  const redirectUri = process.env.META_REDIRECT_URI || 'https://pc-work.it/api/auth/meta/callback';
  const state = crypto.randomBytes(16).toString('hex');
 
  const scope = [
    'pages_show_list',
    'pages_read_engagement',
    'pages_manage_posts',
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
      Location: `https://www.facebook.com/v19.0/dialog/oauth?${qs}`,
      'Set-Cookie': `meta_oauth_state=${state}; Path=/; Max-Age=600; Secure; HttpOnly; SameSite=Lax`
    },
    body: ''
  };
};
