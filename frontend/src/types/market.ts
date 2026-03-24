export type TradeSide = "yes" | "no";

export interface Trade {
  time: string;
  amount: number;
  side: TradeSide;
}

export interface Market {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  resolutionTime?: string;
  status: "open" | "closed";
  volume: number;
  trades: Trade[];
  // optional on-chain wiring (used elsewhere)
  voteContractAddress?: string;
  voteAbi?: any;
  tradeContractAddress?: string;
  tradeAbi?: any;
}
