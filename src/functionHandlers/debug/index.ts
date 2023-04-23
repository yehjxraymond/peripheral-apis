import type { APIGatewayProxyEvent } from "aws-lambda";
import { publicRequestHandler } from "../../middlewares/handlers";
import { config } from "../../config";
import { getLogger } from "../../common/logger";

const { info } = getLogger("debug");

const handleDebug = async (event: APIGatewayProxyEvent) => {
  info(JSON.stringify(event));
  info(JSON.stringify(config));
  return { status: "OK" };
};

export const handler = publicRequestHandler(handleDebug);
