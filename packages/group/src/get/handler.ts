import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from "aws-lambda";
import {adminApiProxy, newApiResponse} from "../../../../commons/ApiProxy";
import {getGroupByPK, getGroupList, GroupGetRequest} from "../../GroupFunction";
import {parseBody} from "../../../../commons/utils/CommonUtils";
import {PK, SK, TableName} from "../../../../commons/type/Types";
import {GroupItem} from "../../../../commons/items/GroupItem";

const tableName: TableName = process.env.DYNAMODB_TABLE ?? '';

// 그룹 ID로 그룹 조회
export const getGroupById: APIGatewayProxyHandler = adminApiProxy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const requestBody: GroupGetRequest = parseBody<GroupGetRequest>(event);
  const pk: PK = requestBody.key.pk;
  const sk: SK = requestBody.key.sk;

  if (!pk || !sk) {
    return newApiResponse(400, "The 'pk' and 'sk' fields are required.");
  }

  const group: GroupItem = await getGroupByPK(pk, sk, tableName);

  if (!group.PK) {
    return newApiResponse(404, "Group not found.");
  }

  return newApiResponse(200, group);
});

// 조직 ID로 그룹 목록 조회
export const getGroupByOrgId: APIGatewayProxyHandler = adminApiProxy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const {orgPk} = JSON.parse(event.body ?? '{}');
  if (!orgPk) {
    return newApiResponse(400, "The 'orgPk' field is required.");
  }

  const groups: Array<GroupItem> = await getGroupList(tableName, orgPk);

  if (groups.length === 0) {
    return newApiResponse(404, "Group not found.");
  }

  return newApiResponse(200, groups);
});
