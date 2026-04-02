import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

// The Graph subgraph endpoint for RangeZone on RSK Testnet
// You'll need to deploy your subgraph first, then update this URL
// Format: https://api.studio.thegraph.com/query/{SUBGRAPH_ID}/latest
// For now, using a placeholder - replace with your actual deployed subgraph
export const SUBGRAPH_URL =
  process.env.NEXT_PUBLIC_SUBGRAPH_URL ||
  "https://api.studio.thegraph.com/query/YOUR_SUBGRAPH_ID/latest";

export const client = new ApolloClient({
  ssrMode: typeof window === "undefined", // Handle SSR
  link: new HttpLink({
    uri: SUBGRAPH_URL,
    credentials: "same-origin",
  }),
  cache: new InMemoryCache(),
});
