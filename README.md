# AI-Enabled Transactive Energy Platform

An enterprise-grade P2P energy trading platform combining Blockchain, AI, and IoT.

## Project Structure

- `smart-contracts/`: Hardhat project with Solidity contracts (P2PTrading, EnergyToken, AssetOwnership).
- `backend/`: Microservices architecture.
  - `services/api-gateway`: Main Node.js/Express API.
  - `services/ai-service`: Python/FastAPI service for forecasting and matching.
  - `services/iot-service`: Node.js service for smart meter data ingestion.
- `frontend/`: Next.js React application.
- `ai-models/`: Model training scripts and data.
- `iot-simulators/`: Tools to simulate smart meter traffic.

## Prerequisites

- Docker & Docker Compose
- Node.js (v18+)
- Python 3.9+
- MetaMask

## Setup & Run

### 1. Start Infrastructure (Docker)

```bash
docker-compose up --build
```

This starts:
- MongoDB
- API Gateway (Port 3001)
- AI Service (Port 8000)

### 2. Smart Contracts

```bash
cd smart-contracts
npm install
npx hardhat node
# In new terminal:
npx hardhat run scripts/deploy.js --network localhost
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

## Architecture Highlights

- **Blockchain**: Ethereum/Energy Web Chain (Solidity)
- **AI**: Python (TensorFlow/Scikit-learn) for consumption forecasting.
- **IoT**: Real-time data ingestion pipeline.
