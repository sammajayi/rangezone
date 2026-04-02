export const RANGE_ZONE_ADDRESS = "0x3dcDc6FbE53dD8c55F53EA0653f22787E9FFCe36" as const;
export const MOCK_PRICE_FEED_ADDRESS = "0xD2b7A578BAe996E2bB040B827cE9C26e4EC34342" as const;

export const RANGE_ZONE_ABI = [
  {
    inputs: [
      { name: "_priceFeed", type: "address", internalType: "address" },
      { name: "_maxPriceAge", type: "uint256", internalType: "uint256" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "ReentrancyGuardReentrantCall",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "marketId", type: "uint256" },
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "Claimed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "marketId", type: "uint256" },
      { indexed: false, internalType: "int256", name: "startPrice", type: "int256" },
      { indexed: false, internalType: "uint256", name: "expiry", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "threshold1", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "threshold2", type: "uint256" },
    ],
    name: "MarketCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "marketId", type: "uint256" },
      { indexed: false, internalType: "uint8", name: "winningBracket", type: "uint8" },
      { indexed: false, internalType: "int256", name: "endPrice", type: "int256" },
    ],
    name: "Resolved",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "marketId", type: "uint256" },
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "uint8", name: "bracket", type: "uint8" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "Staked",
    type: "event",
  },
  {
    inputs: [],
    name: "FEE",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "accumulatedFee",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "", type: "uint256" },
      { internalType: "uint8", name: "", type: "uint8" },
    ],
    name: "bracketTotals",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_marketId", type: "uint256" }],
    name: "claim",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_duration", type: "uint256" },
      { internalType: "uint256", name: "_threshold1", type: "uint256" },
      { internalType: "uint256", name: "_threshold2", type: "uint256" },
    ],
    name: "createMarket",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getCurrentMarket",
    outputs: [
      { internalType: "uint256", name: "id", type: "uint256" },
      {
        components: [
          { internalType: "int256", name: "startPrice", type: "int256" },
          { internalType: "int256", name: "endPrice", type: "int256" },
          { internalType: "uint256", name: "expiry", type: "uint256" },
          { internalType: "uint256", name: "totalPool", type: "uint256" },
          { internalType: "uint8", name: "winningBracket", type: "uint8" },
          { internalType: "enum RangeZone.MarketState", name: "state", type: "uint8" },
          { internalType: "uint256", name: "threshold1", type: "uint256" },
          { internalType: "uint256", name: "threshold2", type: "uint256" },
        ],
        internalType: "struct RangeZone.Market",
        name: "m",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_marketId", type: "uint256" }],
    name: "getMarket",
    outputs: [
      {
        components: [
          { internalType: "int256", name: "startPrice", type: "int256" },
          { internalType: "int256", name: "endPrice", type: "int256" },
          { internalType: "uint256", name: "expiry", type: "uint256" },
          { internalType: "uint256", name: "totalPool", type: "uint256" },
          { internalType: "uint8", name: "winningBracket", type: "uint8" },
          { internalType: "enum RangeZone.MarketState", name: "state", type: "uint8" },
          { internalType: "uint256", name: "threshold1", type: "uint256" },
          { internalType: "uint256", name: "threshold2", type: "uint256" },
        ],
        internalType: "struct RangeZone.Market",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "marketCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "maxPriceAge",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "priceFeed",
    outputs: [{ internalType: "contract AggregatorV3Interface", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_marketId", type: "uint256" }],
    name: "resolve",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "", type: "uint256" },
      { internalType: "uint8", name: "", type: "uint8" },
      { internalType: "address", name: "", type: "address" },
    ],
    name: "stakes",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_marketId", type: "uint256" },
      { internalType: "uint8", name: "_bracket", type: "uint8" },
    ],
    name: "stake",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "withdrawFee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export type MarketState = 0 | 1 | 2;
export const MarketStateLabel: Record<number, string> = {
  0: "Open",
  1: "Closed",
  2: "Resolved",
};

export interface MarketInfo {
  startPrice: bigint;
  endPrice: bigint;
  expiry: bigint;
  totalPool: bigint;
  winningBracket: number;
  state: MarketState;
  threshold1: bigint;
  threshold2: bigint;
}

export function formatPrice(price: bigint): string {
  return `$${(Number(price) / 1e8).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

export function formatRbtc(wei: bigint): string {
  // Mock price: 1 tRBTC = $30,000 (adjust as needed)
  const MOCK_PRICE_USD = 30000;

  const tRbtcAmount = Number(wei) / 1e18;
  const usdAmount = tRbtcAmount * MOCK_PRICE_USD;

  return `$${usdAmount.toFixed(2)}`;
}

export function getBracketLabel(bracket: number, threshold1: bigint, threshold2: bigint): string {
  const t1 = Number(threshold1);
  const t2 = Number(threshold2);
  if (bracket === 0) return `< ${t1}% move`;
  if (bracket === 1) return `${t1}% – ${t2}% move`;
  return `> ${t2}% move`;
}
