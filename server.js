const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();



console.log("🚀 Starting OC Grass Fed chatbot...");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));


app.post('/api/chat', async (req, res) => {
  const userMessage = req.body.message;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `
You are OC Grass Fed's customer service assistant. Here is what you should know:

- OC Grass Fed delivers grass-fed, pasture-raised beef directly to customers in Orange County, CA.
- We offer three types of beef: 
  1. Grass-fed, grass-finished pasture raised beef, sourced from a regenrative ranch (starting at $15.89/lb for a full cow)
  2. Grass-fed Wagyu, grass-finished pasture raised from a regernative ranch (starting at $21/lb for a full cow)
- Customers can order whole, half, eighth or quarter cows. 
- All orders are butchered to order by a small family owned artisan processor (USDA Certified), vacuum-sealed, and delivered frozen. All beef is single-origin, meaning customers will get meat all from the smae cow, unlike any grocery store where there can be dozens and dozens of cows in a single pack of ground beef.
- Delivery is coordinated via a 2-hour window the day before.
- Deposits are non-refundable and are 30% of the estimated packaged weight.
- Cows are raised on free-range ranches in Montana, and live high-quality, low-stress lives on open pastures eating high quality grasses jsut as nature intended.
- We focus on ethical sourcing, sustainability, and nutritional quality.

Answer customer questions as if you're part of the OC Grass Fed team. Keep responses friendly, clear, and helpful.
            `
          },
          { role: 'user', content: userMessage }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log("🧠 Full response from OpenAI:", JSON.stringify(response.data, null, 2));


    const reply = response.data.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Something went wrong.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ OC Grass Fed chatbot running on port ${PORT}`);
});
