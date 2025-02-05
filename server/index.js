import express from 'express';
import axios from 'axios';
import { Buffer } from 'buffer';
import { Configuration, OpenAIApi } from 'openai';

// Initialize Express app
const app = express();
const port = 3000;

// Middleware to parse JSON body
app.use(express.json());

// Configure OpenAI
const configuration = new Configuration({
  apiKey: 'your_openai_api_key', // Replace with your OpenAI API key
});
const openai = new OpenAIApi(configuration);

app.post('/api/analyze', async (req, res) => {
  try {
    const ip = req.ip || req.connection.remoteAddress;
    console.log(`[${new Date().toISOString()}] Analysis request from IP: ${ip}`);

    const { imageUrl } = req.body;
    console.log(`🔍 Analyzing image: ${imageUrl}`);

    // Download image and convert to Base64
    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const base64Image = Buffer.from(imageResponse.data).toString('base64');
    const mimeType = imageResponse.headers['content-type'];

    const response = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: `<h1>Roast this image in 126 characters:</h1><p>Image URL: data:${mimeType};base64,${base64Image}</p>`,
        },
      ],
    });

    console.log(`[${new Date().toISOString()}] ✅ Analysis successful for IP: ${ip}`);
    res.json({ description: response.data.choices[0].message.content });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ❌ Error for IP ${ip}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(3450, '0.0.0.0', () => {
  console.log('Server is running on http://0.0.0.0:3000');
});
