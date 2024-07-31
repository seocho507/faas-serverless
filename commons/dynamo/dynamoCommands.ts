import {
  BatchGetItemCommand,
  BatchGetItemCommandInput,
  DeleteItemCommand,
  DeleteItemCommandInput,
  GetItemCommand,
  GetItemCommandInput,
  PutItemCommand,
  PutItemCommandInput,
  QueryCommand,
  QueryCommandInput,
  TransactWriteItemsCommand,
  TransactWriteItemsCommandInput,
  UpdateItemCommand,
  UpdateItemCommandInput
} from "@aws-sdk/client-dynamodb";
import dynamoClient from "./DynamoConfig";

export const putItem = async (params: PutItemCommandInput) => {
  const command = new PutItemCommand(params);
  return await dynamoClient.send(command);
};

export const getItem = async (params: GetItemCommandInput) => {
  const command = new GetItemCommand(params);
  return await dynamoClient.send(command);
};

export const updateItem = async (params: UpdateItemCommandInput) => {
  const command = new UpdateItemCommand(params);
  return await dynamoClient.send(command);
};

export const deleteItem = async (params: DeleteItemCommandInput) => {
  const command = new DeleteItemCommand(params);
  return await dynamoClient.send(command);
};

export const executeTransactWrite = async (transactItems: TransactWriteItemsCommandInput) => {
  const command = new TransactWriteItemsCommand(transactItems);
  return await dynamoClient.send(command);
};

export const getQueryItem = async (params: QueryCommandInput) => {
  const command = new QueryCommand(params);
  return await dynamoClient.send(command);
}

export const getBatchItem = async (params: BatchGetItemCommandInput): Promise<any> => {
  const command = new BatchGetItemCommand(params);
  return await dynamoClient.send(command);
};
