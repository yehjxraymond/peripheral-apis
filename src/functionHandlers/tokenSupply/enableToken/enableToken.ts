import type { APIGatewayProxyEvent } from "aws-lambda";
import { BadRequest } from "http-errors";
import { publicRequestHandlerWithBodyParser } from "../../../middlewares/handlers";
import { getLogger } from "../../../common/logger";
import { db } from "../../../services/db";
import { NETWORKS, config } from "../../../config";

const { info } = getLogger("enableToken");

const isValidNetwork = (network: string) => {
  return Object.keys(config.networks).includes(network);
};

const handleRegisterReferee = async (event: APIGatewayProxyEvent) => {
  const { network, token } = event.pathParameters as {
    network?: NETWORKS;
    token?: `0x${string}`;
  };
  if (!network) throw new BadRequest("Missing network");
  if (!token) throw new BadRequest("Missing token");
  if (!isValidNetwork(network)) throw new BadRequest("Invalid network");
  const { enabled, ttl } = event.body as { enabled?: boolean; ttl?: number };
  if (!enabled) throw new BadRequest("Missing enabled");
  if (!ttl) throw new BadRequest("Missing ttl");

  const now = Date.now();
  const targetTtl = Math.floor(now / 1000) + ttl; // time where api stops working, in seconds
  const storageTtl = Math.floor(now / 1000) + ttl * 2; // time where item is deleted from db, in seconds

  info(`Registering token ${token} on network ${network}`);

  await db
    .put({
      TableName: config.tableName,
      Item: {
        PK: `#SUPPLY_API`,
        SK: `#NETWORK#${network.toLowerCase()}#CONTRACT#${token.toLowerCase()}`,
        attributes: {
          created: now,
          enabled,
          ttl: targetTtl,
        },
        ttl: storageTtl,
      },
    })
    .promise();

  return {
    created: now,
    enabled,
    targetTtl,
    storageTtl,
  };
};

export const handler = publicRequestHandlerWithBodyParser(
  handleRegisterReferee
);
