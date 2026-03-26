import { rsktestnet } from "../src/lib/utils/RootstockTestnet";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { rootstock } from "wagmi/chains";
import { http } from "wagmi";

export const rainbowkitConfig = getDefaultConfig({
  appName: "RangeZone",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [rsktestnet, rootstock],
  transports: {
    [rootstock.id]: http("https://public-node.rsk.co"),
    [rsktestnet.id]: http("https://public-node.testnet.rsk.co"),
  },
});
