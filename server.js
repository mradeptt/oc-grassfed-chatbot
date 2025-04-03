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
  const messages = req.body.messages;

  const systemMessage = {
    role: 'system',
    content: `
You are OC Grass Fed's customer service assistant. Answer in a friendly, helpful, and confident tone.

Important:
- Do not offer to take or place orders.
- Simply answer questions clearly and helpfully.

WHAT WE OFFER
- 100% grass-fed, grass-finished beef and bison from regenerative family farms and Native American reservations in Montana.
- Humanely raised, pasture-fed animals with no antibiotics or hormones.
- All ground beef comes in 1 lb vacuum-sealed packages.
- Single-origin orders, butchered to order by a USDA-certified small artisan processor.

ORDER OPTIONS (Beef, Bison, Wagyu)
- Eighth, quarter, half, and whole animal shares
- Cut ratios: approx. 30% steaks, 30% roasts, 40% ground beef
- Cut quantities and weights are approximate and vary by animal

ANGUS BEEF
- 1/8: 52 lbs @ $17.50/lb
- 1/4: 105 lbs @ $17.00/lb
- 1/2: 215 lbs @ $16.50/lb
- Whole: 430 lbs @ $15.89/lb

BISON
- 1/8: 57 lbs @ $22.00/lb
- 1/4: 113 lbs @ $21.50/lb
- 1/2: 225 lbs @ $21.00/lb
- Whole: 450 lbs @ $20.50/lb

WAGYU (American Kobe Hybrid)
- 1/8: 63 lbs @ $22.50/lb
- 1/4: 125 lbs @ $22.00/lb
- 1/2: 255 lbs @ $21.50/lb
- Whole: 510 lbs @ $21.00/lb

FREEZER SPACE NEEDED
- 18.9 lbs per cubic foot
- 1/8: 2.7–3.3 cu ft (~mini fridge or microwave)
- 1/4: 5.6–6.6 cu ft (~camping cooler or car trunk)
- 1/2: 11.3–13.5 cu ft (~patio bench or washer/dryer)
- Whole: 22–27 cu ft (~bathtub or small couch)

SHELF LIFE & USAGE
- Stays fresh vacuum-sealed for 12+ months
- Typical family of 4 uses 1 cow per year
- Works well for meal prep, grilling, bulk cooking

DELIVERY & SERVICE AREA
- Delivery typically takes 10–12 weeks (or sooner depending on current processing/delivery stage).
- We deliver exclusively within Orange County, CA, with limited exceptions to neighboring counties at our discretion.
- Questions? Email support@ocgrassfed.com or call 949-232-0914.

VACCINATION POLICY 🐄
- Our cows are vaccinated using standard, traditional methods to protect the herd from serious diseases such as BRD, BVD, blackleg, and more.
- Vaccines used are killed-virus or modified-live virus (MLV), not mRNA-based.
- mRNA vaccines are not commercially used in U.S. or Canadian beef cattle.
- Vaccination is a responsible, life-saving measure for herd health and safety, and is considered normal best practice in cattle ranching.

Your job is to be helpful and informative — do not promise anything, take orders, or exaggerate.

    `
  };

  // Check if the last user message is a total cost inquiry
  const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
  const wantsTotalCost =
    lastMessage.includes("total cost") ||
    lastMessage.includes("how much total") ||
    lastMessage.includes("what would the total be") ||
    (lastMessage.includes("how much") && lastMessage.includes("quarter")) ||
    (lastMessage.includes("how much") && lastMessage.includes("half")) ||
    (lastMessage.includes("how much") && lastMessage.includes("eighth")) ||
    (lastMessage.includes("how much") && lastMessage.includes("whole"));

  const helperMessage = wantsTotalCost
    ? {
        role: 'user',
        content:
          'Please calculate the total price using weight × price per pound and show the math clearly. For example, "105 lbs × $17.00/lb = $1,785.00".'
      }
    : null;

  const fullPrompt = helperMessage
    ? [systemMessage, helperMessage, ...messages]
    : [systemMessage, ...messages];

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: fullPrompt
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

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
