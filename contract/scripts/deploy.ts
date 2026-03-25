import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with:", deployer.address);
  console.log(
    "Balance:",
    ethers.formatEther(await ethers.provider.getBalance(deployer.address)),
    "rBTC"
  );

  //  MockPriceFeed
  const MockPriceFeed = await ethers.getContractFactory("MockPriceFeed");
  const mockPriceFeed = await MockPriceFeed.deploy();
  await mockPriceFeed.waitForDeployment();

  const mockAddress = await mockPriceFeed.getAddress();
  console.log("MockPriceFeed deployed to:", mockAddress);

  // OPTIONAL: set initial price (important!)
  await mockPriceFeed.setPrice(3000000000000);

  // 2️deploy RangeZone with mock address
  const RangeZone = await ethers.getContractFactory("RangeZone");
  const rangeZone = await RangeZone.deploy(mockAddress);
  await rangeZone.waitForDeployment();

  console.log("RangeZone deployed to:", await rangeZone.getAddress());
  console.log("Using Mock Price Feed:", mockAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

