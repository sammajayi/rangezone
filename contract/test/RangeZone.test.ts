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
      await rangeZone.createMarket(3600, 1, 2); // 1 hour duration
      const market = await rangeZone.getMarketInfo();

      expect(market.startPrice).to.equal(3000000000000); // mock price
      expect(market.state).to.equal(0); // Open
    });

    it("should revert if called by non owner", async function () {
      await expect(
        rangeZone.connect(user1).createMarket(3600, 1, 2)
      ).to.be.revertedWith("Only owner");
    });
  });

  describe("stake", function () {
    beforeEach(async function () {
      await rangeZone.createMarket(3600);
    });

    it("should allow user to stake in a valid bracket", async function () {
      await rangeZone.connect(user1).stake(0, {
        value: ethers.parseEther("0.01"),
      });
      const staked = await rangeZone.stakes(0, user1.address);
      expect(staked).to.equal(ethers.parseEther("0.01"));
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
      await rangeZone.createMarket(3600);
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
  });

  describe("claim", function () {
    beforeEach(async function () {
      await rangeZone.createMarket(3600);
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
  });

  describe("withdrawFee", function () {
    beforeEach(async function () {
      await rangeZone.createMarket(3600);
      await rangeZone.connect(owner).stake(0, {
        value: ethers.parseEther("0.01"),
      });
      await time.increase(3601);
      await rangeZone.resolve();
      await rangeZone.connect(owner).claim();
    });

    it("should allow owner to withdraw accumulated fee", async function () {
      const fee = await rangeZone.accumulatedFee();
      expect(fee).to.be.gt(0);
      await expect(rangeZone.withdrawFee()).to.not.be.reverted;
    });

    it("should revert if non owner tries to withdraw fee", async function () {
      await expect(rangeZone.connect(owner).withdrawFee()).to.be.revertedWith(
        "Only owner"
      );
    });
  });
});