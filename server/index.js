import axios from 'axios';
import { Buffer } from 'buffer';

app.post('/api/analyze', async (req, res) => {
  try {
    const ip = req.ip || req.connection.remoteAddress;
    console.log(`[${new Date().toISOString()}] Analysis request from IP: ${ip}`);

    const { imageUrl } = req.body;
    console.log(`🔍 Analyzing image: ${imageUrl}`);
    
    // Download image and convert to base64
    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const base64Image = Buffer.from(imageResponse.data).toString('base64');
    const mimeType = imageResponse.headers['content-type'];
    
    const response = await openai.chat.completions.create({
      model: "chatgpt-4o-latest",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "DRead thsi image and raost the image in 126 characters , return roast in type <h1> headingand then <p>" },
            { 
              type: "image_url",
              image_url: {
                "url": `data:${mimeType};base64,${base64Image}`
              }
            }
          ],
        },
      ],
      store: true,
    });

    console.log(`[${new Date().toISOString()}] ✅ Analysis successful for IP: ${ip}`);
    res.json({ description: response.choices[0].message.content });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ❌ Error for IP ${req.ip}:`, error);
    res.status(500).json({ error: error.message });
  }
});