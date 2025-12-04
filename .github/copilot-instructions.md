# GitHub Copilot Instructions

## Project Overview
This is an enterprise-grade Transactive Energy Platform combining Blockchain (Ethereum/Hardhat), AI (Python/FastAPI), IoT, and a Modern Web Frontend (Next.js).

## Architecture & Service Boundaries
- **Frontend (`frontend/`)**: Next.js (App Router) application. Interacts directly with Smart Contracts via `ethers.js` and the API Gateway for off-chain data.
- **API Gateway (`backend/services/api-gateway/`)**: Node.js/Express service. Acts as the central orchestrator for off-chain data (User profiles, Energy data) and proxies requests to the AI service.
- **AI Service (`backend/services/ai-service/`)**: Python/FastAPI service. Provides consumption forecasting and P2P matching logic.
- **Smart Contracts (`smart-contracts/`)**: Solidity contracts managed via Hardhat. Handles token logic (ERC20/ERC721) and trading settlement.
- **Database**: MongoDB (accessed via API Gateway).

## Critical Workflows

### 1. Infrastructure Startup
The backend services and database run via Docker Compose.
```bash
docker-compose up --build
```
*Note: This starts MongoDB (27017), API Gateway (3001), and AI Service (8000).*

### 2. Smart Contract Development
Contracts must be deployed to a local Hardhat node before the frontend can interact with them.
1. Start node: `npx hardhat node` (in `smart-contracts/`)
2. Deploy: `npx hardhat run scripts/deploy.js --network localhost`
3. **Important**: After deployment, ensure artifacts (ABIs) in `frontend/contracts/` and addresses in `frontend/config.ts` match the new deployment.

### 3. Frontend Development
Run the Next.js app locally:
```bash
cd frontend
npm run dev
```

## Coding Conventions

### Frontend (Next.js + Ethers.js)
- **Web3 Integration**: Use `ethers.BrowserProvider(window.ethereum)` for browser interactions.
- **Artifacts**: Import contract JSONs from `../contracts/Name.json`.
- **State Management**: Use React hooks (`useState`, `useEffect`) for local state.
- **Directives**: Remember `"use client"` for components using hooks or browser-only APIs.
- **Example**: See `frontend/components/Marketplace.tsx` for the pattern of initializing contracts and fetching data.

### Backend (Node.js/Express)
- **Routing**: Define routes in `src/routes/` and mount them in `app.js`.
- **Database**: Use Mongoose models (`src/models/`) for MongoDB interactions.
- **Async/Await**: Use `async/await` for all DB and network operations.

### AI Service (Python/FastAPI)
- **Type Safety**: Use Pydantic models (`BaseModel`) for request/response validation.
- **Endpoints**: Define endpoints with clear type hints (e.g., `def predict(request: PredictionRequest)`).

### Smart Contracts (Solidity)
- **Standards**: Follow OpenZeppelin standards for ERC20/ERC721.
- **Security**: Use `Ownable` and `ReentrancyGuard` where appropriate.

## Common Patterns
- **Off-chain vs On-chain**: Store heavy data (historical energy usage, user profiles) in MongoDB via API Gateway. Store value transfer and ownership proofs on-chain.
- **Service Communication**: API Gateway communicates with AI Service via HTTP REST calls.
