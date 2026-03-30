import { gql } from "graphql-tag";

export const GET_USER_STAKES = gql`
  query GetUserStakes($user: String!) {
    stakeds(
      where: { user: $user }
      orderBy: blockNumber
      orderDirection: desc
      first: 1000
    ) {
      id
      marketId
      user
      bracket
      amount
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`;

export const GET_USER_CLAIMS = gql`
  query GetUserClaims($user: String!) {
    claimeds(
      where: { user: $user }
      orderBy: blockNumber
      orderDirection: desc
      first: 1000
    ) {
      id
      marketId
      user
      amount
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`;

export const GET_LEADERBOARD = gql`
  query GetLeaderboard {
    stakeds(
      orderBy: blockNumber
      orderDirection: desc
      first: 10000
    ) {
      user
      amount
      marketId
    }
  }
`;

export const GET_MARKET_DETAILS = gql`
  query GetMarketDetails($marketId: String!) {
    markets(where: { id: $marketId }) {
      id
      marketId
      startPrice
      expiry
      threshold1
      threshold2
      blockTimestamp
    }
  }
`;
