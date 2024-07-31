import {UserItem} from "../../commons/items/UserItem";
import {newUserSK, timestamp} from "../../commons/utils/CommonUtils";
import {hashPassword} from "../../commons/utils/SecurityUtils";
import {marshall, unmarshall} from "@aws-sdk/util-dynamodb";
import {
  deleteItem,
  getBatchItem,
  getItem,
  getQueryItem,
  putItem
} from "../../commons/dynamo/dynamoCommands";
import {Constants} from "../../commons/Constants";
import {GroupItem} from "../../commons/items/GroupItem";
import {QueryCommandInput} from "@aws-sdk/client-dynamodb";
import {DynamoKey, NullableString, PK, SK, TableName} from "../../commons/type/Types";

export interface UserCreateRequest {
  name: string;
  email: string;
  password: string;
  orgPk: PK;
  groups: string[];
}

export interface UserDeleteRequest {
  key: DynamoKey;
}

export interface UserGetRequest {
  key: DynamoKey;
}

export interface UsersInGroupGetRequest {
  orgPk: PK;
  groupSk: SK;
}

export interface UsersInOrgGetRequest {
  orgPk: PK;
}

export interface UserUpdateRequest {
  key: DynamoKey;
  name: NullableString;
  email: NullableString;
  password: NullableString;
  groups?: SK[]
}

export const saveUser = async (request: UserCreateRequest, tableName: TableName): Promise<void> => {
  const userItem: UserItem = {
    PK: request.orgPk,
    SK: newUserSK(),
    createdAt: timestamp(),
    name: request.name,
    email: request.email,
    password: await hashPassword(request.password),
    groups: request.groups
  }

  const userCreateParams = {
    TableName: tableName,
    Item: marshall(userItem)
  };

  await putItem(userCreateParams);
}

export const findUserByKey = async (pk: PK, sk: SK, tableName: TableName): Promise<UserItem> => {
  const userParams = {
    TableName: tableName,
    Key: marshall({PK: pk, SK: sk})
  };

  const userData = await getItem(userParams);

  if (!userData.Item) {
    throw new Error("User not found.");
  }
  return unmarshall(userData.Item) as UserItem;
}

export const findUsersInOrganization = async (orgPk: PK, tableName: TableName): Promise<Array<UserItem>> => {
  const userParams = {
    TableName: tableName,
    KeyConditionExpression: "PK = :orgPk and begins_with(SK, :prefix)",
    ExpressionAttributeValues: marshall({
      ":orgPk": orgPk,
      ":prefix": Constants.USER_PREFIX
    })
  };

  const userData = await getQueryItem(userParams);

  if (!userData.Items || userData.Items.length === 0) {
    throw new Error("User not found.");
  }

  return userData.Items.map(item => unmarshall(item) as UserItem);
}

export const findUsersInGroup = async (orgPk: PK, groupSk: string, tableName: TableName): Promise<Array<UserItem>> => {
  const userParams = {
    TableName: tableName,
    KeyConditionExpression: "PK = :orgPk and begins_with(SK, :prefix)",
    ExpressionAttributeValues: marshall({
      ":orgPk": orgPk,
      ":prefix": Constants.USER_PREFIX
    })
  };

  const userData = await getQueryItem(userParams);

  if (!userData.Items || userData.Items.length === 0) {
    throw new Error("User not found.");
  }
  const users: Array<UserItem> = userData.Items.map(item => unmarshall(item) as UserItem);

  return users.filter(user => user.groups.some(sk => sk === groupSk));
}

export const deleteUserByKey = async (pk: PK,
                                      sk: SK,
                                      tableName: TableName): Promise<void> => {
  const userParams = {
    TableName: tableName,
    Key: marshall({PK: pk, SK: sk})
  };

  const userData = await getItem(userParams);

  if (!userData.Item) {
    throw new Error("User not found.");
  }

  await deleteItem(userParams);
}

export const getGroupsFromUserItem = async (userItem: UserItem,
                                            tableName: TableName): Promise<GroupItem[]> => {
  const batchGetGroupParams = {
    RequestItems: {
      [tableName]: {
        Keys: userItem.groups.map(groupSk => marshall({PK: userItem.PK, SK: groupSk}))
      }
    }
  };

  const batchResult = await getBatchItem(batchGetGroupParams);
  const groups = batchResult.Responses?.[tableName] ?? [];
  return groups.map((group: DynamoObject) => unmarshall(group) as GroupItem);
};

// 사용자 수 조회
export const getUserCount = async (tableName: TableName,
                                   orgPk: PK): Promise<number> => {
  const userParams: QueryCommandInput = {
    TableName: tableName,
    KeyConditionExpression: "PK = :orgPk and begins_with(SK, :prefix)",
    ExpressionAttributeValues: {
      ":orgPk": {S: orgPk},
      ":prefix": {S: Constants.USER_PREFIX}
    },
    Select: "COUNT"
  };

  const user = await getQueryItem(userParams);

  return user.Count ?? 0;
};
