import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from "aws-lambda";
import {adminApiProxy, newApiResponse} from "../../../../commons/ApiProxy";
import {getGroupByPK, getGroupList, GroupUpdateRequest, updateGroup} from "../../GroupFunction";
import {GroupItem, GroupList} from "../../../../commons/items/GroupItem";
import {isNotNullOrEmptyString, parseBody} from "../../../../commons/utils/CommonUtils";
import {PK, SK, TableName} from "../../../../commons/type/Types";

const tableName: TableName = process.env.DYNAMODB_TABLE ?? '';

export const putGroup: APIGatewayProxyHandler = adminApiProxy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const requestBody: GroupUpdateRequest = parseBody<GroupUpdateRequest>(event);
  const pk: PK = requestBody.key.pk;
  const sk: SK = requestBody.key.sk;
  const name: string = requestBody.name;

  if (!pk || !sk) {
    return newApiResponse(400, "The 'pk' and 'sk' fields are required.");
  }

  if (isNotNullOrEmptyString(name)) {
    return newApiResponse(400, "The 'name' field is required and cannot be blank.");
  }

  const groupData: GroupItem = await getGroupByPK(pk, sk, tableName);
  if (!groupData.PK) {
    return newApiResponse(404, "Group not found.");
  }

  // 그룹명 중복체크
  const groupList: GroupList = new GroupList(await getGroupList(tableName, pk));
  if (groupList.checkExistByName(name)) {
    return newApiResponse(400, "Group name already exists.");
  }

  await updateGroup(pk, sk, name, tableName);

  return newApiResponse(200, "Group updated successfully.");
});
