const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // 1. Deploy Energy Token
  const initialSupply = hre.ethers.parseEther("1000000"); // 1 Million Tokens
  const energyToken = await hre.ethers.deployContract("EnergyToken", [initialSupply]);
  await energyToken.waitForDeployment();
  console.log(`EnergyToken deployed to: ${energyToken.target}`);

  // 2. Deploy Asset Ownership (NFT)
  const assetOwnership = await hre.ethers.deployContract("AssetOwnership");
  await assetOwnership.waitForDeployment();
  console.log(`AssetOwnership deployed to: ${assetOwnership.target}`);

  // 3. Deploy Settlement
  const settlement = await hre.ethers.deployContract("Settlement", [energyToken.target]);
  await settlement.waitForDeployment();
  console.log(`Settlement deployed to: ${settlement.target}`);

  // 4. Deploy P2P Trading Contract
  const p2pTrading = await hre.ethers.deployContract("P2PTrading", [energyToken.target]);
  await p2pTrading.waitForDeployment();
  console.log(`P2PTrading deployed to: ${p2pTrading.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
