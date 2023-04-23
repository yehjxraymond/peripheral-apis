import SDK from "aws-sdk";
import { captureAWS } from "aws-xray-sdk-core";

export const AWS = process.env.IS_OFFLINE ? SDK : captureAWS(SDK);
