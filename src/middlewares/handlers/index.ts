import middy from "@middy/core";
import httpSecurityHeaders from "@middy/http-security-headers";
import jsonBodyParser from "@middy/http-json-body-parser";
import { withBoundary } from "../withBoundary";

export const publicRequestHandler = (handler: any) => middy(handler).use(httpSecurityHeaders()).use(withBoundary());

export const publicRequestHandlerWithBodyParser = (handler: any) => publicRequestHandler(handler).use(jsonBodyParser());
