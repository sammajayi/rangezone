import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config();

// Environment variable setup
const { RSK_MAINNET_RPC_URL, RSK_TESTNET_RPC_URL, PRIVATE_KEY, } = process.env;

// Validate env variables
if (!RSK_MAINNET_RPC_URL) {
  throw new Error("Missing RSK_MAINNET_RPC_URL");
}

if (!RSK_TESTNET_RPC_URL) {
  throw new Error("Missing RSK_TESTNET_RPC_URL");
}

if (!PRIVATE_KEY) {
  throw new Error("Missing PRIVATE_KEY");
}


const RSK_TESTNET_RPC = process.env.RSK_TESTNET_RPC_URL || "https://public-node.testnet.rsk.co";
const RSK_MAINNET_RPC = process.env.RSK_MAINNET_RPC_URL || "https://public-node.rsk.co";


const config: HardhatUserConfig = {

  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: false,
        runs: 200
      }
    }
  },
  networks: {
    rskMainnet: {

      url: RSK_MAINNET_RPC_URL,
      chainId: 30,
      gasPrice: 60000000,
      accounts: [PRIVATE_KEY]
    },
    rskTestnet: {

      url: RSK_TESTNET_RPC_URL,
      chainId: 31,
      gasPrice: 60000000,
      accounts: [PRIVATE_KEY]
    },
  },

  // TODO 3: Configure paths
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },

  // Gas Reporter configuration
  // gasReporter: {
  //     enabled: process.env.REPORT_GAS === "true",
  //     currency: "USD"
  // }

};

export default config;







