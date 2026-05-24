// social-publishing.js
const { publishPromotion } = require('./social-publisher');
const fs = require('fs');
const path = require('path');

/**
 * Handles social media publishing when promotions are created in the admin panel.
 */

const postToSocialMedia = async (promotion) => {
    // Logic to publish promotion to social media platforms
    try {
        const { title, body, images } = promotion;
        const imageUrl = images && images.length > 0 ? images[0] : '';
        const caption = title;
        const content = `${title}\n\n${body}`;

        let platforms = ['Facebook', 'Instagram', 'Telegram'];
        try {
            const settingsPath = path.join(__dirname, '..', '..', 'content', 'social_settings.json');
            const raw = fs.readFileSync(settingsPath, 'utf8');
            const settings = JSON.parse(raw);
            if (settings && settings.enabled === false) platforms = [];
            const list = Array.isArray(settings?.platforms) ? settings.platforms : [];
            platforms = platforms.filter(p => {
                const found = list.find(x => String(x?.name || '').toLowerCase() === String(p).toLowerCase());
                if (!found) return false;
                return found.enabled !== false;
            });
        } catch (e) {}

        if (platforms.length > 0) {
            await publishPromotion(content, imageUrl, caption, platforms);
        }
        console.log('Promotion successfully posted to social media.');
    } catch (error) {
        console.error('Failed to post promotion to social media:', error);
    }
};

module.exports = postToSocialMedia;
