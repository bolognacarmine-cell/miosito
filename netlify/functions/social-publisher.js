const { GraphAPI } = require('facebook-graph-api');
const axios = require('axios');

const facebookPageAccessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
const instagramAccessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
const telegramChatID = process.env.TELEGRAM_CHAT_ID;

async function publishToFacebook(content) {
    try {
        const response = await GraphAPI.post('/me/feed', {
            message: content,
            access_token: facebookPageAccessToken
        });
        console.log('Published to Facebook:', response.data);
    } catch (error) {
        console.error('Error publishing to Facebook:', error);
        throw error;
    }
}

async function publishToInstagram(imageUrl, caption) {
    try {
        const response = await axios.post(`https://graph.facebook.com/v10.0/me/media?image_url=${imageUrl}&caption=${caption}&access_token=${instagramAccessToken}`);
        console.log('Published to Instagram:', response.data);
    } catch (error) {
        console.error('Error publishing to Instagram:', error);
        throw error;
    }
}

async function publishToTelegram(message) {
    try {
        const response = await axios.post(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
            chat_id: telegramChatID,
            text: message
        });
        console.log('Published to Telegram:', response.data);
    } catch (error) {
        console.error('Error publishing to Telegram:', error);
        throw error;
    }
}

async function publishPromotion(content, imageUrl, caption) {
    try {
        await publishToFacebook(content);
        await publishToInstagram(imageUrl, caption);
        await publishToTelegram(content);
    } catch (error) {
        console.error('Error publishing promotion:', error);
        // Retry logic can be implemented here if needed.
    }
}

module.exports = { publishPromotion };