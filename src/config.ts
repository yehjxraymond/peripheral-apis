// polyfill fetch for viem
import "isomorphic-unfetch";
import { mainnet, polygon, optimism, arbitrum, bsc } from "viem/chains";

export type NETWORKS = "ethereum" | "polygon" | "optimism" | "arbitrum" | "bsc";
const generateNetworks = () => {
  const key = process.env.ALCHEMY_KEY;
  if (!key) throw new Error("Missing ALCHEMY_KEY in .env");
  return {
    ethereum: {
      url: `https://eth-mainnet.alchemyapi.io/v2/${key}`,
      chain: mainnet,
    },
    polygon: {
      url: `https://polygon-mainnet.g.alchemy.com/v2/${key}`,
      chain: polygon,
    },
    optimism: {
      url: `https://optimism-mainnet.g.alchemy.com/v2/${key}`,
      chain: optimism,
    },
    arbitrum: {
      url: `https://arbitrum-mainnet.g.alchemy.com/v2/${key}`,
      chain: arbitrum,
    },
    bsc: {
      url: "https://bsc-dataseed.binance.org/",
      chain: bsc,
    },
  };
};
const generateConfig = () => ({
  appName: "govn",
  tableName: process.env.DYNAMODB_TABLE_NAME || "",
  networks: generateNetworks(),
});

export const config = generateConfig();
