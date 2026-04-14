const axios = require('axios');

// Social media engagement tracker
class EngagementTracker {
    constructor(apiUrl) {
        this.apiUrl = apiUrl;
    }

    async trackEngagement(postId) {
        try {
            const response = await axios.get(`${this.apiUrl}/posts/${postId}/engagement`);
            const data = response.data;
            const metrics = {
                likes: data.likes,
                comments: data.comments,
                shares: data.shares,
                impressions: data.impressions,
            };
            console.log(`Post ${postId} Engagement Metrics:`, metrics);
            return metrics;
        } catch (error) {
            console.error('Error fetching engagement metrics:', error);
            throw error;
        }
    }
}

// Example usage
// const tracker = new EngagementTracker('https://api.socialmedia.com');
// tracker.trackEngagement('12345');
