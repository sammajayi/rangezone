import { ethers } from "hardhat";
import { expect } from "chai";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("RangeZone", function () {
  let rangeZone: any;
  let owner: any;
  let user1: any;
  let user2: any;
  let mockPriceFeed: any;

  // deploy a mock price feed and the RangeZone contract before each test
  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // deploy mock price feed
    const MockPriceFeed = await ethers.getContractFactory("MockPriceFeed");
    mockPriceFeed = await MockPriceFeed.deploy();

    // deploy RangeZone with mock price feed
    const RangeZone = await ethers.getContractFactory("RangeZone");
    rangeZone = await RangeZone.deploy(await mockPriceFeed.getAddress());
  });

  describe("createMarket", function () {
    it("should create a market with correct start price and expiry", async function () {
      await rangeZone.createMarket(3600, 3, 7);
      const market = await rangeZone.getMarketInfo();
      expect(market.startPrice).to.equal(3000000000000); // 3000 with 8 decimals
      expect(market.state).to.equal(0); // Open
      const currentTime = Math.floor(Date.now() / 1000);
      expect(market.expiry).to.be.gt(currentTime + 3590); // at least 3590 seconds from now
      expect(market.expiry).to.be.lt(currentTime + 3610); // at most 3610 seconds from now
    });

    it("should revert if called by non-owner", async function () {
      await expect(
        rangeZone.connect(user1).createMarket(3600, 3, 7)
      ).to.be.revertedWith("Only owner");
    });

    // from here
    it("should isolate stakes and bracketTotals between markets", async function () {
      // Market 1
      await rangeZone.createMarket(3600, 3, 7);
      await rangeZone.connect(user1).stake(0, { value: ethers.parseEther("1") });

      await time.increase(3601);
      await rangeZone.resolve();

      // Market 2
      await rangeZone.createMarket(3600, 3, 7);
      const market2 = await rangeZone.getMarketInfo();

      expect(await rangeZone.stakes(2, 0, user1.address)).to.equal(0);
      expect(await rangeZone.bracketTotals(2, 0)).to.equal(0);
    });

    it("should revert if the price feed returns stale price on createMarket", async function () {
      // Force mock to return old timestamp
      await mockPriceFeed.setPriceWithTimestamp(3000000000000, Math.floor(Date.now() / 1000) - 2 * 24 * 3600);

      await expect(rangeZone.createMarket(3600, 3, 7)).to.be.revertedWith("Price too old");
    });

    it("should revert if the price feed returns zero price", async function () {
      await mockPriceFeed.setPrice(0);
      await expect(rangeZone.createMarket(3600, 3, 7)).to.be.revertedWith("Invalid price");
    });

  });

  describe("stake", function () {
    beforeEach(async function () {
      await rangeZone.createMarket(3600, 3, 7);
    });
    it("should allow user to stake in a valid bracket", async function () {
      await rangeZone.connect(user1).stake(0, { value: ethers.parseEther("1") });
      const stake = await rangeZone.stakes(1, 0, user1.address);
      expect(stake).to.equal(ethers.parseEther("1"));
    });

    it("should revert if bracket is invalid", async function () {
      await expect(
        rangeZone.connect(user1).stake(3, {
          value: ethers.parseEther("0.01"),
        })
      ).to.be.revertedWith("Invalid bracket");
    });

    it("should revert if no value is sent", async function () {
      await expect(
        rangeZone.connect(user1).stake(0, { value: 0 })
      ).to.be.revertedWith("No stake sent");
    });
  });

  describe("resolve", function () {
    beforeEach(async function () {
      await rangeZone.createMarket(3600, 5, 10);
      await rangeZone.connect(user1).stake(0, {
        value: ethers.parseEther("0.01"),
      });
    });

    it("should revert if market has not expired", async function () {
      await expect(rangeZone.resolve()).to.be.revertedWith("Not yet expired");
    });

    it("should resolve to bracket 0 for small movement", async function () {
      // keep price same as start price
      await time.increase(3601);
      await rangeZone.resolve();
      const market = await rangeZone.getMarketInfo();
      expect(market.winningBracket).to.equal(0);
      expect(market.state).to.equal(2); // Resolved
    });

    it("should resolve to bracket 1 for medium movement", async function () {
      // set end price to 5% above start price
      await mockPriceFeed.setPrice(3150000000000); // 5% above 3000000000000
      await time.increase(3601);
      await rangeZone.resolve();
      const market = await rangeZone.getMarketInfo();
      expect(market.winningBracket).to.equal(1);
    });

    it("should resolve to bracket 2 for large movement", async function () {
      // set end price to 10% above start price
      await mockPriceFeed.setPrice(3300000000000); // 10% above 3000000000000
      await time.increase(3601);
      await rangeZone.resolve();
      const market = await rangeZone.getMarketInfo();
      expect(market.winningBracket).to.equal(2);
    });

    it("should revert resolve if endPrice is zero", async function () {
  await mockPriceFeed.setPrice(0);
  await time.increase(3601);
  await expect(rangeZone.resolve()).to.be.revertedWith("Invalid end price");
});
  });

  describe("claim", function () {
    beforeEach(async function () {
      await rangeZone.createMarket(3600, 1, 2);
      await rangeZone.connect(user1).stake(0, {
        value: ethers.parseEther("0.01"),
      });
      await rangeZone.connect(user2).stake(1, {
        value: ethers.parseEther("0.01"),
      });
      await time.increase(3601);
      await rangeZone.resolve(); // bracket 0 wins since price stays same
    });

    it("should allow winner to claim payout", async function () {
      const balanceBefore = await ethers.provider.getBalance(user1.address);
      await rangeZone.connect(user1).claim();
      const balanceAfter = await ethers.provider.getBalance(user1.address);
      expect(balanceAfter).to.be.gt(balanceBefore);
    });

    it("should revert if loser tries to claim", async function () {
      await expect(rangeZone.connect(user2).claim()).to.be.revertedWith(
        "Nothing to claim"
      );
    });

    it("should revert if winner claims twice", async function () {
      await rangeZone.connect(user1).claim();
      await expect(rangeZone.connect(user1).claim()).to.be.revertedWith(
        "Nothing to claim"
      );
    });

    it("should prevent reentrancy on claim", async function () {
      // Use your existing user1 stake & market setup
      await rangeZone.connect(user1).claim();

      // Attempt to claim again
      await expect(rangeZone.connect(user1).claim()).to.be.revertedWith("Nothing to claim");
    });

  });

  describe("withdrawFee", function () {
    beforeEach(async function () {
      await rangeZone.createMarket(3600, 1, 2);
      await rangeZone.connect(user1).stake(0, {
        value: ethers.parseEther("0.01"),
      });
      await time.increase(3601);
      await rangeZone.resolve();
      await rangeZone.connect(user1).claim();
    });

    it("should allow owner to withdraw accumulated fee", async function () {
      const fee = await rangeZone.accumulatedFee();
      expect(fee).to.be.gt(0);
      await expect(rangeZone.withdrawFee()).to.not.be.reverted;
    });

    it("should revert if non owner tries to withdraw fee", async function () {
      await expect(rangeZone.connect(user1).withdrawFee()).to.be.revertedWith(
        "Only owner"
      );
    });
  });
});