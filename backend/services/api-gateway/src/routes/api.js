const express = require('express');
const router = express.Router();
const User = require('../models/User');
const EnergyData = require('../models/EnergyData');

// User Routes
router.post('/users', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get('/users/:walletAddress', async (req, res) => {
  try {
    const user = await User.findOne({ walletAddress: req.params.walletAddress });
    if (!user) return res.status(404).send();
    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Energy Data Routes
router.post('/energy-data', async (req, res) => {
  try {
    const data = new EnergyData(req.body);
    await data.save();
    res.status(201).send(data);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get('/energy-data/:userId', async (req, res) => {
  try {
    const data = await EnergyData.find({ userId: req.params.userId }).sort({ timestamp: -1 }).limit(24); // Last 24 entries
    res.send(data);
  } catch (error) {
    res.status(500).send(error);
  }
});

// AI Service Proxy
router.post('/predict', async (req, res) => {
  try {
    // Try to fetch real data from MongoDB for the demo
    // We'll pick the first user we find to simulate a logged-in session
    let historicalData = [];
    try {
        const user = await User.findOne();
        if (user) {
            // Get last 30 days of data (approx 720 hours)
            const energyData = await EnergyData.find({ userId: user._id })
                .sort({ timestamp: 1 }) // Ascending for time series
                .limit(720); 
            
            if (energyData.length > 0) {
                // Map to [consumption, production, temperature, voltage, frequency]
                historicalData = energyData.map(d => [
                    d.consumption, 
                    d.production,
                    d.temperature || 20, // Default if missing
                    d.voltage || 230,
                    d.frequency || 50
                ]);
                console.log(`Fetched ${historicalData.length} data points from MongoDB for user ${user.username}`);
            }
        }
    } catch (dbErr) {
        console.warn("MongoDB fetch failed (using synthetic fallback):", dbErr.message);
    }

    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://ai-service:8000';
    
    // Merge historical data into request body
    const requestBody = {
        ...req.body,
        historical_data: historicalData
    };

    const response = await fetch(`${aiServiceUrl}/predict/consumption`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      throw new Error(`AI Service responded with ${response.status}`);
    }
    
    const data = await response.json();
    res.send(data);
  } catch (error) {
    console.error('AI Service Error:', error);
    res.status(500).send({ error: 'Failed to fetch prediction' });
  }
});

// Chatbot Route (Gemini)
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      // Fallback mock response if no key provided
      return res.json({ 
        reply: "I'm currently running in demo mode (No API Key). But I can tell you that energy prices are low right now! (Add GEMINI_API_KEY to .env to activate me fully)" 
      });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are an expert AI Energy Assistant for a P2P trading platform. 
            Context: The user has consumed 342 kWh and produced 410 kWh in the last 30 days. Their predicted consumption for tomorrow is 12 kWh.
            User Query: ${message}
            Keep answers concise and helpful.`
          }]
        }]
      })
    });

    const data = await response.json();
    
    if (data.candidates && data.candidates[0].content) {
      res.json({ reply: data.candidates[0].content.parts[0].text });
    } else {
      throw new Error('Invalid response from Gemini');
    }

  } catch (error) {
    console.error('Chat Error:', error);
    res.status(500).json({ reply: "I'm having trouble processing that request right now." });
  }
});

module.exports = router;
