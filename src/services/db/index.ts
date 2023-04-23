import { AWS } from "../awsSdk";

const options = process.env.IS_OFFLINE
  ? {
      region: "localhost",
      endpoint: "http://localhost:8000",
      accessKeyId: "MOCK_ACCESS_KEY_ID",
      secretAccessKey: "MOCK_SECRET_ACCESS_KEY",
      convertEmptyValues: true,
    }
  : { convertEmptyValues: true };

export const db = new AWS.DynamoDB.DocumentClient(options);
