const mongoose = require('mongoose');

const energyDataSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, default: Date.now },
  production: { type: Number, default: 0 }, // kWh
  consumption: { type: Number, default: 0 }, // kWh
  batteryLevel: { type: Number, default: 0 }, // %
  // IoT Sensor Data
  temperature: { type: Number, default: 20 }, // Celsius
  voltage: { type: Number, default: 230 }, // Volts
  frequency: { type: Number, default: 50 } // Hz
});

module.exports = mongoose.model('EnergyData', energyDataSchema);
