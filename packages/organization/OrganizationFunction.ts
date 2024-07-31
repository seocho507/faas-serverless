import {marshall, unmarshall} from "@aws-sdk/util-dynamodb";
import {Constants} from "../../commons/Constants";
import {executeTransactWrite, getItem} from "../../commons/dynamo/dynamoCommands";
import {
  AllOrganizationItem,
  OrganizationItem,
  OrganizationList
} from "../../commons/items/OrganizationItem";
import {
  isNotNullOrEmptyString,
  newOrganizationPK,
  timestamp
} from "../../commons/utils/CommonUtils";
import {TransactWriteItemsCommandInput} from "@aws-sdk/client-dynamodb";
import {DynamoKey, NullableString, PK, TableName} from "../../commons/type/Types";

export interface OrganizationCreateRequest {
  name: string;
  description: NullableString;
}

export interface OrganizationDeleteRequest {
  key: DynamoKey
}

export interface OrganizationUpdateRequest {
  key: DynamoKey,
  name: NullableString,
  description: NullableString
}

export interface OrganizationGetRequest {
  key: DynamoKey
}

export const getAllOrganizationData = async (tableName: TableName): Promise<Array<OrganizationItem>> => {
  const params = {
    TableName: tableName,
    Key: marshall({
      PK: Constants.ADMIN,
      SK: Constants.ORG_LIST
    })
  };

  const result = await getItem(params);
  const item = result.Item ?
      unmarshall(result.Item) as AllOrganizationItem : Constants.EMPTY_ALL_ORGANIZATION_ITEM;

  return item.data ? item.data : Constants.EMPTY_LIST;
}

export const getOrganizationByPK = async (pk: PK, tableName: TableName): Promise<OrganizationItem> => {
  const params = {
    TableName: tableName,
    Key: marshall({PK: pk, SK: pk})
  };
  const result = await getItem(params);
  return result.Item ? unmarshall(result.Item) as OrganizationItem : Constants.EMPTY_ORGANIZATION_ITEM;
}

export const createNewOrganizationItem = (requestData: OrganizationCreateRequest): OrganizationItem => {
  const key: string = newOrganizationPK();

  return {
    PK: key,
    SK: key,
    name: requestData.name,
    description: isNotNullOrEmptyString(requestData.description) ? requestData.description : "",
    createdAt: timestamp()
  };
}

export const saveOrganization = async (organizationItem: OrganizationItem,
                                       organizationList: OrganizationList,
                                       tableName: TableName): Promise<void> => {
  organizationList.addOrganization(organizationItem);

  const transactItems: TransactWriteItemsCommandInput = {
    TransactItems: [
      {
        Put: {
          TableName: tableName,
          Item: marshall(organizationItem)
        },
      },
      {
        Update: {
          TableName: tableName,
          Key: marshall({PK: Constants.ADMIN, SK: Constants.ORG_LIST}),
          UpdateExpression: "SET #data = :updatedData",
          ExpressionAttributeNames: {"#data": "data"},
          ExpressionAttributeValues: {":updatedData": organizationList.toDynamoDBList()}
        },
      },
    ]
  };

  await executeTransactWrite(transactItems);
}

export const deleteOrganizationItem = async (pk: PK,
                                             organizationList: OrganizationList,
                                             tableName: TableName): Promise<void> => {
  organizationList.removeOrganization(pk)
  const transactItems: TransactWriteItemsCommandInput = {
    TransactItems: [
      {
        Delete: {
          TableName: tableName,
          Key: marshall({PK: pk, SK: pk}),
        }
      },
      {
        Update: {
          TableName: tableName,
          Key: marshall({PK: Constants.ADMIN, SK: Constants.ORG_LIST}),
          UpdateExpression: "SET #data = :updatedData",
          ExpressionAttributeNames: {"#data": "data"},
          ExpressionAttributeValues: {":updatedData": organizationList.toDynamoDBList()}
        }
      }
    ]
  };

  await executeTransactWrite(transactItems);
}
