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

  // Verify Facebook
  if (!facebookPageAccessToken) {
    results.facebook = { status: 'error', message: 'Token mancante' };
  } else {
    try {
      const response = await axios.get(`https://graph.facebook.com/me?access_token=${facebookPageAccessToken}`);
      results.facebook = { status: 'success', message: `Connesso come ${response.data.name}` };
    } catch (error) {
      results.facebook = { status: 'error', message: error.response?.data?.error?.message || error.message };
    }
  }

  // Verify Instagram (requires business account linked to FB)
  if (!instagramAccessToken) {
    results.instagram = { status: 'error', message: 'Token mancante' };
  } else {
    try {
      const response = await axios.get(`https://graph.facebook.com/v10.0/me?fields=name&access_token=${instagramAccessToken}`);
      results.instagram = { status: 'success', message: `Connesso come ${response.data.name}` };
    } catch (error) {
      results.instagram = { status: 'error', message: error.response?.data?.error?.message || error.message };
    }
  }

  // Verify Telegram
  if (!telegramBotToken || !telegramChatID) {
    results.telegram = { status: 'error', message: 'Token o Chat ID mancante' };
  } else {
    try {
      const response = await axios.get(`https://api.telegram.org/bot${telegramBotToken}/getMe`);
      if (response.data.ok) {
        results.telegram = { status: 'success', message: `Bot: @${response.data.result.username}` };
      } else {
        results.telegram = { status: 'error', message: 'Token non valido' };
      }
    } catch (error) {
      results.telegram = { status: 'error', message: error.message };
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify(results),
  };
};
