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
  const instagramAccessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
  const telegramChatID = process.env.TELEGRAM_CHAT_ID;

  const envInstructions = "Assicurati di aver impostato questa variabile nel pannello Netlify > Site settings > Environment variables";
  const socialSettingsHint = "Puoi disattivare temporaneamente questa piattaforma dal CMS (Impostazioni Sito > Configurazione Social).";

  const readSocialSettings = () => {
    try {
      const settingsPath = path.join(__dirname, '..', '..', 'content', 'social_settings.json');
      const raw = fs.readFileSync(settingsPath, 'utf8');
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  };

  const socialSettings = readSocialSettings();
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
      const response = await axios.get(`https://graph.facebook.com/me?access_token=${facebookPageAccessToken}`);
      results.facebook = { status: 'success', message: `Connesso come ${response.data.name}` };
    } catch (error) {
      const apiMsg = error.response?.data?.error?.message || error.message;
      results.facebook = { status: 'error', message: `Errore API Facebook: ${apiMsg}. Controlla se il token è scaduto o se hai i permessi necessari.` };
    }
  }

  // Verify Instagram
  if (!isPlatformEnabled('Instagram')) {
    results.instagram = { status: 'disabled', message: "Instagram è disattivato nel CMS." };
  } else if (!instagramAccessToken) {
    results.instagram = { status: 'error', message: `Token INSTAGRAM_ACCESS_TOKEN mancante. ${envInstructions}. ${socialSettingsHint}` };
  } else {
    try {
      const response = await axios.get(`https://graph.facebook.com/v10.0/me?fields=name&access_token=${instagramAccessToken}`);
      results.instagram = { status: 'success', message: `Connesso come ${response.data.name}` };
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
