import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying with:", deployer.address);

  const balance = await ethers.provider.getBalance(
    deployer.address
  );

  console.log(
    "Balance:",
    ethers.formatEther(balance),
    "tRBTC"
  );

  /*
    STEP 1 — Deploy MockPriceFeed
  */

  const MockPriceFeed =
    await ethers.getContractFactory(
      "MockPriceFeed"
    );

  const mock =
    await MockPriceFeed.deploy();

  await mock.waitForDeployment();

  const mockAddress =
    await mock.getAddress();

  console.log(
    "MockPriceFeed deployed to:",
    mockAddress
  );

  /*
    STEP 2 — Deploy RangeZone
  */

  const MAX_PRICE_AGE =
    14n * 24n * 60n * 60n; // 14 days

  const RangeZone =
    await ethers.getContractFactory(
      "RangeZone"
    );

  const rangeZone =
    await RangeZone.deploy(
      mockAddress,
      MAX_PRICE_AGE
    );

  await rangeZone.waitForDeployment();

  const rangeZoneAddress =
    await rangeZone.getAddress();

  console.log(
    "RangeZone deployed to:",
    rangeZoneAddress
  );

  console.log(
    "Using MockPrice:",
    mockAddress
  );

  console.log(
    "Max price age:",
    MAX_PRICE_AGE,
    "seconds"
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});