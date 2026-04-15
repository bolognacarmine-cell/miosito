const axios = require('axios');

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

  // Verify Facebook
  if (!facebookPageAccessToken) {
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
  if (!instagramAccessToken) {
    results.instagram = { status: 'error', message: `Token INSTAGRAM_ACCESS_TOKEN mancante. ${envInstructions}` };
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
  if (!telegramBotToken || !telegramChatID) {
    results.telegram = { status: 'error', message: `TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID mancanti. ${envInstructions}` };
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
