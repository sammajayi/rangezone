import { defineChain } from "viem";

export const rskTestnet = defineChain({
  id: 31,
  name: "RSK Testnet",
  network: "rsk-testnet",
  nativeCurrency: {
    name: "RBTC",
    symbol: "tRBTC",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://public-node.testnet.rsk.co"],
    },
  },
  blockExplorers: {
    default: {
      name: "RSK Explorer",
      url: "https://rootstock-testnet.blockscout.com",
    },
  },
});