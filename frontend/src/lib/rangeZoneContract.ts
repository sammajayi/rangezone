export const RANGE_ZONE_ADDRESS = "0x73689f97092c0b27DDd90cd59b14Ca691dE754D7" as const;

export const RANGE_ZONE_ABI = [
  {
    type: "constructor",
    inputs: [{ name: "_priceFeed", type: "address", internalType: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "createMarket",
    inputs: [
      { name: "_duration", type: "uint256", internalType: "uint256" },
      { name: "_threshold1", type: "uint256", internalType: "uint256" },
      { name: "_threshold2", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "stake",
    inputs: [
      { name: "_marketId", type: "uint256", internalType: "uint256" },
      { name: "_bracket", type: "uint8", internalType: "uint8" },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "resolve",
    inputs: [{ name: "_marketId", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "claim",
    inputs: [{ name: "_marketId", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "withdrawFee",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getCurrentMarket",
    inputs: [],
    outputs: [
      { name: "id", type: "uint256", internalType: "uint256" },
      {
        name: "m",
        type: "tuple",
        internalType: "struct RangeZone.Market",
        components: [
          { name: "startPrice", type: "int256", internalType: "int256" },
          { name: "endPrice", type: "int256", internalType: "int256" },
          { name: "expiry", type: "uint256", internalType: "uint256" },
          { name: "totalPool", type: "uint256", internalType: "uint256" },
          { name: "winningBracket", type: "uint8", internalType: "uint8" },
          { name: "state", type: "uint8", internalType: "enum RangeZone.MarketState" },
          { name: "threshold1", type: "uint256", internalType: "uint256" },
          { name: "threshold2", type: "uint256", internalType: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getMarket",
    inputs: [{ name: "_marketId", type: "uint256", internalType: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct RangeZone.Market",
        components: [
          { name: "startPrice", type: "int256", internalType: "int256" },
          { name: "endPrice", type: "int256", internalType: "int256" },
          { name: "expiry", type: "uint256", internalType: "uint256" },
          { name: "totalPool", type: "uint256", internalType: "uint256" },
          { name: "winningBracket", type: "uint8", internalType: "uint8" },
          { name: "state", type: "uint8", internalType: "enum RangeZone.MarketState" },
          { name: "threshold1", type: "uint256", internalType: "uint256" },
          { name: "threshold2", type: "uint256", internalType: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "stakes",
    inputs: [
      { name: "", type: "uint256", internalType: "uint256" },
      { name: "", type: "uint8", internalType: "uint8" },
      { name: "", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "bracketTotals",
    inputs: [
      { name: "", type: "uint256", internalType: "uint256" },
      { name: "", type: "uint8", internalType: "uint8" },
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "marketCount",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "accumulatedFee",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "MarketCreated",
    inputs: [
      { name: "marketId", type: "uint256", indexed: true },
      { name: "startPrice", type: "int256", indexed: false },
      { name: "expiry", type: "uint256", indexed: false },
      { name: "threshold1", type: "uint256", indexed: false },
      { name: "threshold2", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "Staked",
    inputs: [
      { name: "marketId", type: "uint256", indexed: true },
      { name: "user", type: "address", indexed: true },
      { name: "bracket", type: "uint8", indexed: false },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "Resolved",
    inputs: [
      { name: "marketId", type: "uint256", indexed: true },
      { name: "winningBracket", type: "uint8", indexed: false },
      { name: "endPrice", type: "int256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "Claimed",
    inputs: [
      { name: "marketId", type: "uint256", indexed: true },
      { name: "user", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
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
  return `${(Number(wei) / 1e18).toFixed(6)} tRBTC`;
}

export function getBracketLabel(bracket: number, threshold1: bigint, threshold2: bigint): string {
  const t1 = Number(threshold1);
  const t2 = Number(threshold2);
  if (bracket === 0) return `< ${t1}% move`;
  if (bracket === 1) return `${t1}% – ${t2}% move`;
  return `> ${t2}% move`;
}
