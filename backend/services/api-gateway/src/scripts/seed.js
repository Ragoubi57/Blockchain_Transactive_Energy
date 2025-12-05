const mongoose = require('mongoose');
const { ethers } = require('ethers');
const User = require('../models/User');
const EnergyData = require('../models/EnergyData');
require('dotenv').config({ path: '../../.env' }); // Try to load from root if possible, or just rely on defaults

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/te-platform';

const ROLES = ['producer', 'consumer', 'prosumer'];

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for seeding');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

const generateRandomWallet = () => {
  const wallet = ethers.Wallet.createRandom();
  return wallet.address;
};

const generateSyntheticData = async () => {
  await connectDB();

  try {
    // Clear existing data
    await User.deleteMany({});
    await EnergyData.deleteMany({});
    console.log('Cleared existing data');

    const users = [];
    
    // Create 5 Users
    for (let i = 1; i <= 5; i++) {
      const role = i === 1 ? 'producer' : (i === 2 || i === 3 ? 'prosumer' : 'consumer');
      const user = new User({
        username: `user${i}`,
        email: `user${i}@example.com`,
        walletAddress: generateRandomWallet(),
        role: role
      });
      const savedUser = await user.save();
      users.push(savedUser);
      console.log(`Created user: ${savedUser.username} (${savedUser.role})`);
    }

    // Generate 30 days of hourly data for each user
    const now = new Date();
    const days = 30;
    const hours = days * 24;

    for (const user of users) {
      const dataPoints = [];
      for (let h = 0; h < hours; h++) {
        const timestamp = new Date(now.getTime() - (hours - h) * 60 * 60 * 1000);
        const hourOfDay = timestamp.getHours();
        
        let production = 0;
        let consumption = 0;
        let batteryLevel = 0;

        // Basic synthetic logic
        // Solar production peaks at noon (hour 12)
        if (user.role === 'producer' || user.role === 'prosumer') {
            if (hourOfDay >= 6 && hourOfDay <= 18) {
                // Bell curve-ish approximation
                production = Math.max(0, 10 - Math.abs(12 - hourOfDay) * 1.5) + (Math.random() * 2);
            }
        }

        // Consumption peaks morning (8-10) and evening (18-21)
        const isPeak = (hourOfDay >= 8 && hourOfDay <= 10) || (hourOfDay >= 18 && hourOfDay <= 21);
        const baseLoad = 1 + Math.random();
        consumption = isPeak ? baseLoad + 3 + Math.random() * 2 : baseLoad;

        // IoT Sensor Simulation
        // Temperature: Cold night, warm day
        const temperature = 15 + 10 * Math.sin((hourOfDay - 9) * 2 * Math.PI / 24) + (Math.random() * 2 - 1);
        
        // Voltage: Dips slightly when consumption is high
        const voltage = 230 - (consumption * 0.2) + (Math.random() * 1 - 0.5);
        
        // Frequency: Very stable around 50Hz
        const frequency = 50 + (Math.random() * 0.04 - 0.02);

        // Battery logic (simplified)
        if (user.role === 'prosumer') {
            // Charge during day if excess production
            if (production > consumption) {
                batteryLevel = Math.min(100, batteryLevel + (production - consumption) * 5);
            } else {
                // Discharge if consumption > production
                batteryLevel = Math.max(0, batteryLevel - (consumption - production) * 5);
            }
        }

        dataPoints.push({
          userId: user._id,
          timestamp,
          production: parseFloat(production.toFixed(2)),
          consumption: parseFloat(consumption.toFixed(2)),
          batteryLevel: parseFloat(batteryLevel.toFixed(2)),
          temperature: parseFloat(temperature.toFixed(1)),
          voltage: parseFloat(voltage.toFixed(1)),
          frequency: parseFloat(frequency.toFixed(3))
        });
      }
      
      await EnergyData.insertMany(dataPoints);
      console.log(`Generated ${dataPoints.length} data points for ${user.username}`);
    }

    console.log('Seeding complete!');
    process.exit(0);

  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

generateSyntheticData();
