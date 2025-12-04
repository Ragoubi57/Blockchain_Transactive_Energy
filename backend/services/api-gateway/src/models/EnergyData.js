const mongoose = require('mongoose');

const energyDataSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, default: Date.now },
  production: { type: Number, default: 0 }, // kWh
  consumption: { type: Number, default: 0 }, // kWh
  batteryLevel: { type: Number, default: 0 } // %
});

module.exports = mongoose.model('EnergyData', energyDataSchema);
