const axios = require('axios');
const { publishPromotion } = require('./social-publisher');

exports.handler = async (event, context) => {
  console.log('Deploy succeeded trigger started...');

  const owner = 'bolognacarmine-cell';
  const repo = 'miosito';
  const githubToken = process.env.GITHUB_TOKEN; // Optional but recommended

  try {
    // 1. Get the latest commit from the main branch
    const commitResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}/commits/main`, {
      headers: githubToken ? { 'Authorization': `token ${githubToken}` } : {}
    });

    const latestCommitSha = commitResponse.data.sha;
    const files = commitResponse.data.files;

    if (!files || files.length === 0) {
      console.log('No files changed in the latest commit.');
      return { statusCode: 200 };
    }

    // 2. Filter for products or offers that were added or modified
    const changedItems = files.filter(file => 
      (file.status === 'added' || file.status === 'modified') && 
      (file.filename.startsWith('content/prodotti/') || file.filename.startsWith('content/offerte/')) &&
      file.filename.endsWith('.json')
    );

    if (changedItems.length === 0) {
      console.log('No new or modified products/offers to publish.');
      return { statusCode: 200 };
    }

    console.log(`Found ${changedItems.length} items to process.`);

    // 3. Process each item
    for (const item of changedItems) {
      try {
        // Fetch the raw content of the file
        const fileContentResponse = await axios.get(item.raw_url);
        const data = fileContentResponse.data;

        // Check if social publishing is enabled for this item
        if (data.publish_to_social === false || data.active === false) {
          console.log(`Skipping ${item.filename}: social publishing disabled or item inactive.`);
          continue;
        }

        console.log(`Publishing ${item.filename} to social media...`);

        const title = data.title;
        const body = data.body || data.subtitle || '';
        const price = data.price ? `\nPrezzo: ${data.price}` : '';
        
        // Handle images
        let imageUrl = '';
        if (data.images && data.images.length > 0) {
          const firstImg = data.images[0];
          imageUrl = firstImg.url || firstImg.image || firstImg;
        } else if (data.image) {
          imageUrl = data.image;
        }

        // Prepare content
        const content = `${title}\n\n${body}${price}\n\nScopri di più sul nostro sito!`;
        const caption = `${title} - ${body.substring(0, 100)}...`;

        // Publish!
        await publishPromotion(content, imageUrl, caption);
        console.log(`Successfully processed ${item.filename}`);

      } catch (err) {
        console.error(`Error processing file ${item.filename}:`, err.message);
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Social publishing process completed" })
    };

  } catch (error) {
    console.error('Error in deploy-succeeded function:', error.response?.data || error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
