import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from "aws-lambda";
import {adminApiProxy, newApiResponse} from "../../../../commons/ApiProxy";
import {
  deleteGroupAndUpdateUsers,
  getGroupByPK,
  getGroupList,
  getUserGroups,
  GroupDeleteRequest
} from "../../GroupFunction";
import {GroupItem, GroupList} from "../../../../commons/items/GroupItem";
import {isEmptyArray, isEmptyObject, parseBody} from "../../../../commons/utils/CommonUtils";
import {PK, SK, TableName} from "../../../../commons/type/Types";
import {UserItem} from "../../../../commons/items/UserItem";

const tableName: TableName = process.env.DYNAMODB_TABLE ?? '';

export const deleteGroups: APIGatewayProxyHandler = adminApiProxy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const requestData: GroupDeleteRequest = parseBody<GroupDeleteRequest>(event)
  const pk: PK = requestData.key.pk;
  const sk: SK = requestData.key.sk;

  if (!pk || !sk) {
    return newApiResponse(400, "The 'pk' and 'sk' fields are required.");
  }

  const groupData: GroupItem = await getGroupByPK(pk, sk, tableName);
  const userGroups: Array<UserItem> = await getUserGroups(pk, tableName);

  if (isEmptyObject(groupData)) {
    return newApiResponse(404, "Group not found.");
  }

  const allGroupResult: Array<GroupItem> = await getGroupList(tableName, pk);
  if (isEmptyArray(allGroupResult)) {
    return newApiResponse(404, "No groups found for the organization.");
  }

  const groupList: GroupList = new GroupList(allGroupResult);

  await deleteGroupAndUpdateUsers(pk, sk, userGroups, groupList, tableName);

  return newApiResponse(200, "Group deleted successfully.");
});
