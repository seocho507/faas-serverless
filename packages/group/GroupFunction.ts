import {marshall, unmarshall} from "@aws-sdk/util-dynamodb";
import {Constants} from "../../commons/Constants";
import {
  executeTransactWrite,
  getItem,
  getQueryItem,
  putItem,
  updateItem
} from "../../commons/dynamo/dynamoCommands";
import {GroupItem, GroupList} from "../../commons/items/GroupItem";
import {newGroupSK, timestamp} from "../../commons/utils/CommonUtils";
import {QueryCommandInput, TransactWriteItemsCommandInput} from "@aws-sdk/client-dynamodb";
import {UserItem} from "../../commons/items/UserItem";
import {DynamoKey, PK, SK, TableName} from "../../commons/type/Types";

export interface GroupCreateRequest {
  orgPk: PK;
  name: string;
}

export interface GroupDeleteRequest {
  key: DynamoKey;
}

export interface GroupGetRequest {
  key: DynamoKey;
}

export interface GroupUpdateRequest {
  key: DynamoKey;
  name: string;
}

export const getGroupList = async (tableName: TableName, orgPk: PK): Promise<Array<GroupItem>> => {
  const params = {
    TableName: tableName,
    KeyConditionExpression: "PK = :orgPk and begins_with(SK, :prefix)",
    ExpressionAttributeValues: {
      ":orgPk": {S: orgPk},
      ":prefix": {S: Constants.GROUP_PREFIX}
    }
  };
  const result = await getQueryItem(params);
  return result.Items ? result.Items.map(item => unmarshall(item) as GroupItem) : Constants.EMPTY_LIST;
}

export const createNewGroupItem = (requestData: GroupCreateRequest): GroupItem => {
  const key: string = newGroupSK();

  return {
    PK: requestData.orgPk,
    SK: key,
    name: requestData.name,
    createdAt: timestamp()
  };
}

export const saveGroup = async (groupItem: GroupItem, tableName: TableName): Promise<void> => {
  const putParams = {
    TableName: tableName,
    Item: marshall(groupItem)
  };

  await putItem(putParams);
}

export const getGroupByPK = async (pk: PK, sk: SK, tableName: TableName): Promise<GroupItem> => {
  const params = {
    TableName: tableName,
    Key: marshall({PK: pk, SK: sk})
  };
  const result = await getItem(params);
  return result.Item ? unmarshall(result.Item) as GroupItem : Constants.EMPTY_GROUP_ITEM;
}

export const getGroupsByPKAndSKList = async (pk: string, skList: string[], tableName: TableName): Promise<GroupItem[]> => {
  const results = await Promise.all(skList.map(sk => getGroupByPK(pk, sk, tableName)));
  return results.filter(group => group.PK !== undefined);
}

export const updateGroup = async (pk: PK, sk: SK, name: string, tableName: TableName): Promise<void> => {
  const updateParams = {
    TableName: tableName,
    Key: marshall({PK: pk, SK: sk}),
    UpdateExpression: "SET #name = :name",
    ExpressionAttributeNames: {
      "#name": "name"
    },
    ExpressionAttributeValues: {
      ":name": {S: name}
    }
  };

  await updateItem(updateParams);
}

export const getUserGroups = async (orgPk: PK,
                                    tableName: TableName): Promise<UserItem[]> => {
  const params = {
    TableName: tableName,
    KeyConditionExpression: "PK = :orgPk and begins_with(SK, :prefix)",
    ExpressionAttributeValues: {":orgPk": {S: orgPk}, ":prefix": {S: Constants.USER_PREFIX}},
    ProjectionExpression: "PK, SK, groups"
  };

  const result = await getQueryItem(params);
  return result.Items ? result.Items.map(item => unmarshall(item) as UserItem) : Constants.EMPTY_LIST;
}

export const deleteGroupAndUpdateUsers = async (pk: PK,
                                                sk: SK,
                                                userGroups: UserItem[],
                                                groupList: GroupList,
                                                tableName: TableName) => {
  groupList.removeGroup(pk, sk);

  const transactItems: TransactWriteItemsCommandInput = {
    TransactItems: [{
      Delete: {
        TableName: tableName,
        Key: marshall({PK: pk, SK: sk})
      }
    }]
  };

  userGroups.forEach(user => {
    if (user.groups) {
      const updatedGroups = user.groups.filter((groupSK: SK) => groupSK !== sk);

      transactItems.TransactItems!.push({
        Update: {
          TableName: tableName,
          Key: marshall({PK: user.PK, SK: user.SK}),
          UpdateExpression: "SET #groups = :updatedGroups",
          ExpressionAttributeNames: {"#groups": "groups"},
          ExpressionAttributeValues: {":updatedGroups": {L: updatedGroups.map((groupSK: string) => ({S: groupSK}))}}
        }
      });
    }
  });
  await executeTransactWrite(transactItems);
}

// 그룹 수 조회
export const getGroupCount = async (tableName: TableName,
                                    orgPk: PK): Promise<number> => {
  const groupParams: QueryCommandInput = {
    TableName: tableName,
    KeyConditionExpression: "PK = :orgPk and begins_with(SK, :prefix)",
    ExpressionAttributeValues: {
      ":orgPk": {S: orgPk},
      ":prefix": {S: Constants.GROUP_PREFIX}
    },
    Select: "COUNT"
  };

  const groupData = await getQueryItem(groupParams);

  return groupData.Count ?? 0;
};
