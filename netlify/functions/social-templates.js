// social-templates.js

/**
 * Function to generate social media post templates.
 */

const templates = {
    facebook: {
        text: "{userMessage} \n\n #YourHashtags",
        maxLength: 280,
    },
    instagram: {
        text: "{userMessage} \n\n #Instagood",
        maxLength: 2200,
    },
    telegram: {
        text: "{userMessage}",
        maxLength: 4096,
    },
};

/** 
 * Generate a template for a specific platform.
 * @param {string} platform - The social media platform (facebook, instagram, telegram).
 * @param {string} userMessage - The message to format.
 * @returns {string} - The formatted post for the specified platform.
 */
function generateTemplate(platform, userMessage) {
    const template = templates[platform];
    if (!template) {
        throw new Error(`Platform '${platform}' is not supported.`);
    }
    if (userMessage.length > template.maxLength) {
        throw new Error(`Message exceeds maximum length of ${template.maxLength} characters for ${platform}.`);
    }
    return template.text.replace('{userMessage}', userMessage);
}

module.exports = { generateTemplate };