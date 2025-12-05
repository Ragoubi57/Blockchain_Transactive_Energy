# API Gateway & Database Setup

## Prerequisites
- Docker and Docker Compose must be running.
- Node.js installed.

## Setup

1. **Start Infrastructure**
   ```bash
   docker-compose up -d mongo
   ```

2. **Install Dependencies**
   ```bash
   cd backend/services/api-gateway
   npm install
   ```

3. **Seed Database**
   Populate MongoDB with 30 days of synthetic energy data for 5 users.
   ```bash
   npm run seed
   ```
   *Note: This script connects to `mongodb://localhost:27017/te-platform`.*

## Verification
Check if data exists:
```bash
# In a separate terminal
mongosh "mongodb://localhost:27017/te-platform" --eval "db.energydatas.countDocuments()"
```
