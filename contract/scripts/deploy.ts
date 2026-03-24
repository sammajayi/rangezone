import { ethers } from "hardhat";

const PRICE_FEED_ADDRESS = ethers.getAddress("0xe010c800257f6d4cD3C1Cb9b0f29571f652f952");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying RangeZone with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "RBTC");

  const RangeZone = await ethers.getContractFactory("RangeZone");
  const rangeZone = await RangeZone.deploy(PRICE_FEED_ADDRESS);

  await rangeZone.waitForDeployment();

  console.log("RangeZone deployed to:", await rangeZone.getAddress());
  console.log("Price feed address:", PRICE_FEED_ADDRESS);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});