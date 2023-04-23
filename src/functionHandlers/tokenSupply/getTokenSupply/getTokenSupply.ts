import type { APIGatewayProxyEvent } from "aws-lambda";
import { BadRequest } from "http-errors";
import { publicRequestHandler } from "../../../middlewares/handlers";
import { NETWORKS, config } from "../../../config";
import { getLogger } from "../../../common/logger";
import { ERC20 } from "../fixtures/ERC20";
import { db } from "../../../services/db";

import { createPublicClient, http, formatUnits } from "viem";

const { info } = getLogger("getTokenSupply");

// Sample request URL: /token_supply/:network/:token?adjustment=30000

const isValidNetwork = (network: string) => {
  return Object.keys(config.networks).includes(network);
};

const isTokenEnabled = async (network: string, token: string) => {
  const { Item } = await db
    .get({
      TableName: config.tableName,
      Key: {
        PK: `#SUPPLY_API`,
        SK: `#NETWORK#${network.toLowerCase()}#CONTRACT#${token.toLowerCase()}`,
      },
    })
    .promise();
  console.log(Item);

  return (
    Item &&
    Item.attributes &&
    Item.attributes.enabled &&
    Item.attributes.ttl >= Math.floor(Date.now() / 1000)
  );
};

const handleDebug = async (event: APIGatewayProxyEvent) => {
  const adjustment = event.queryStringParameters?.adjustment;
  const { network, token } = event.pathParameters as {
    network?: NETWORKS;
    token?: `0x${string}`;
  };
  if (!network) throw new BadRequest("Missing network");
  if (!token) throw new BadRequest("Missing token");
  if (!isValidNetwork(network)) throw new BadRequest("Invalid network");

  info(`Getting supply for ${token} on ${network}`);

  const enabled = await isTokenEnabled(network, token);

  if (!enabled) throw new BadRequest("Token not enabled");

  const publicClient = createPublicClient({
    transport: http(config.networks[network].url),
    chain: config.networks[network].chain,
  });

  const [totalSupplyResult, decimalsResult] = await publicClient.multicall({
    contracts: [
      {
        address: token,
        abi: ERC20,
        functionName: "totalSupply",
      },
      {
        address: token,
        abi: ERC20,
        functionName: "decimals",
      },
    ],
  });
  if (totalSupplyResult.status !== "success")
    throw new BadRequest("totalSupply call failed");
  if (decimalsResult.status !== "success")
    throw new BadRequest("decimals call failed");

  const supplyFormatted = formatUnits(
    totalSupplyResult.result,
    decimalsResult.result
  );

  info(`Supply for ${token} on ${network} is ${supplyFormatted}`);

  const supply = Number(supplyFormatted);

  if (adjustment) {
    info(`Adjusting supply by ${adjustment}`);
    const adjustedSupply = supply - Number(adjustment);
    return adjustedSupply;
  }
  return supply;
};

export const handler = publicRequestHandler(handleDebug);
