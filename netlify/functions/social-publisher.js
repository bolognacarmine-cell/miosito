const axios = require('axios');

const facebookPageAccessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
const instagramAccessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
const telegramChatID = process.env.TELEGRAM_CHAT_ID;

async function publishToFacebook(content) {
    try {
        const response = await axios.post(`https://graph.facebook.com/v10.0/me/feed`, {
            message: content,
            access_token: facebookPageAccessToken
        });
        console.log('Published to Facebook:', response.data);
    } catch (error) {
        console.error('Error publishing to Facebook:', error.response?.data || error.message);
        throw error;
    }
}

async function publishToInstagram(imageUrl, caption) {
    try {
        // First create a container for the media
        const containerResponse = await axios.post(`https://graph.facebook.com/v10.0/me/media`, {
            image_url: imageUrl,
            caption: caption,
            access_token: instagramAccessToken
        });
        
        const creationId = containerResponse.data.id;
        
        // Then publish the container
        const publishResponse = await axios.post(`https://graph.facebook.com/v10.0/me/media_publish`, {
            creation_id: creationId,
            access_token: instagramAccessToken
        });
        
        console.log('Published to Instagram:', publishResponse.data);
    } catch (error) {
        console.error('Error publishing to Instagram:', error.response?.data || error.message);
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
        console.error('Error publishing to Telegram:', error.response?.data || error.message);
        throw error;
    }
}

async function publishPromotion(content, imageUrl, caption) {
    try {
        if (facebookPageAccessToken) await publishToFacebook(content);
        if (instagramAccessToken && imageUrl) await publishToInstagram(imageUrl, caption);
        if (telegramBotToken && telegramChatID) await publishToTelegram(content);
    } catch (error) {
        console.error('Error publishing promotion:', error);
    }
}

module.exports = { publishPromotion };
