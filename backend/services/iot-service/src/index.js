const express = require('express');
const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

app.post('/telemetry', (req, res) => {
    console.log('Received telemetry:', req.body);
    // In a real app, push to TimescaleDB or Kafka
    res.status(200).send({ status: 'received' });
});

app.listen(PORT, () => {
    console.log(`IoT Service running on port ${PORT}`);
});
