const axios = require('axios');
const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  const results = {
    facebook: { status: 'unknown', message: '' },
    instagram: { status: 'unknown', message: '' },
    telegram: { status: 'unknown', message: '' }
  };

  const facebookPageAccessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  const facebookPageId = process.env.FACEBOOK_PAGE_ID;
  const instagramAccessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const instagramIgUserId = process.env.INSTAGRAM_IG_USER_ID;
  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
  const telegramChatID = process.env.TELEGRAM_CHAT_ID;

  const envInstructions = "Assicurati di aver impostato questa variabile nel pannello Netlify > Site settings > Environment variables";
  const socialSettingsHint = "Puoi disattivare temporaneamente questa piattaforma dal CMS (Impostazioni Sito > Configurazione Social).";

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

  const socialSettings = await readSocialSettings();
  const isPlatformEnabled = (platformName) => {
    if (socialSettings && socialSettings.enabled === false) return false;
    const list = Array.isArray(socialSettings?.platforms) ? socialSettings.platforms : [];
    const found = list.find(p => String(p?.name || '').toLowerCase() === String(platformName || '').toLowerCase());
    if (!found) return false;
    return found.enabled !== false;
  };

  // Verify Facebook
  if (!isPlatformEnabled('Facebook')) {
    results.facebook = { status: 'disabled', message: "Facebook è disattivato nel CMS." };
  } else if (!facebookPageAccessToken) {
    results.facebook = { status: 'error', message: `Token FACEBOOK_PAGE_ACCESS_TOKEN mancante. ${envInstructions}` };
  } else {
    try {
      const meResponse = await axios.get(`https://graph.facebook.com/me?fields=id,name&access_token=${facebookPageAccessToken}`);
      const me = meResponse.data;
      if (facebookPageId) {
        const pageResponse = await axios.get(`https://graph.facebook.com/${facebookPageId}?fields=id,name&access_token=${facebookPageAccessToken}`);
        const page = pageResponse.data;
        results.facebook = { status: 'success', message: `Pagina: ${page.name} (ID: ${page.id})` };
        if (String(me?.id) !== String(page?.id)) {
          results.facebook.message += ` | Token collegato a: ${me.name} (ID: ${me.id})`;
        }
      } else {
        results.facebook = { status: 'success', message: `Connesso come ${me.name} (ID: ${me.id})` };
      }
    } catch (error) {
      const apiMsg = error.response?.data?.error?.message || error.message;
      results.facebook = { status: 'error', message: `Errore API Facebook: ${apiMsg}. Controlla se il token è scaduto o se hai i permessi necessari.` };
    }
  }

  // Verify Instagram
  if (!isPlatformEnabled('Instagram')) {
    results.instagram = { status: 'disabled', message: "Instagram è disattivato nel CMS." };
  } else if (!instagramAccessToken || !instagramIgUserId) {
    const missing = [];
    if (!instagramAccessToken) missing.push('INSTAGRAM_ACCESS_TOKEN');
    if (!instagramIgUserId) missing.push('INSTAGRAM_IG_USER_ID');
    results.instagram = { status: 'error', message: `Variabili mancanti: ${missing.join(', ')}. ${envInstructions}. ${socialSettingsHint}` };
  } else {
    try {
      const response = await axios.get(`https://graph.facebook.com/v20.0/${instagramIgUserId}?fields=id,username&access_token=${instagramAccessToken}`);
      results.instagram = { status: 'success', message: `Account IG: @${response.data.username} (ID: ${response.data.id})` };
    } catch (error) {
      const apiMsg = error.response?.data?.error?.message || error.message;
      results.instagram = { status: 'error', message: `Errore API Instagram: ${apiMsg}. Assicurati che l'account Instagram sia di tipo Business e collegato alla pagina Facebook.` };
    }
  }

  // Verify Telegram
  if (!isPlatformEnabled('Telegram')) {
    results.telegram = { status: 'disabled', message: "Telegram è disattivato nel CMS." };
  } else if (!telegramBotToken || !telegramChatID) {
    results.telegram = { status: 'error', message: `TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID mancanti. ${envInstructions}. ${socialSettingsHint}` };
  } else {
    try {
      const response = await axios.get(`https://api.telegram.org/bot${telegramBotToken}/getMe`);
      if (response.data.ok) {
        results.telegram = { status: 'success', message: `Bot: @${response.data.result.username}` };
      } else {
        results.telegram = { status: 'error', message: 'Token Telegram non valido.' };
      }
    } catch (error) {
      results.telegram = { status: 'error', message: `Errore API Telegram: ${error.message}` };
    }
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(results),
  };
};
