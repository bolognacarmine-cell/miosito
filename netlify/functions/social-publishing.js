// social-publishing.js
const { publishPromotion } = require('./social-publisher');

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
        
        await publishPromotion(content, imageUrl, caption);
        console.log('Promotion successfully posted to social media.');
    } catch (error) {
        console.error('Failed to post promotion to social media:', error);
    }
};

module.exports = postToSocialMedia;