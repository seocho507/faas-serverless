import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from "aws-lambda";
import {adminApiProxy, newApiResponse} from "../../../../commons/ApiProxy";
import {createNewGroupItem, getGroupList, GroupCreateRequest, saveGroup} from "../../GroupFunction";
import {getOrganizationByPK} from "../../../organization/OrganizationFunction"
import {GroupItem, GroupList} from "../../../../commons/items/GroupItem";
import {TableName} from "../../../../commons/type/Types";
import {parseBody} from "../../../../commons/utils/CommonUtils";
import {OrganizationItem} from "../../../../commons/items/OrganizationItem";

const tableName: TableName = process.env.DYNAMODB_TABLE ?? '';

export const createGroups: APIGatewayProxyHandler = adminApiProxy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const requestData: GroupCreateRequest = parseBody<GroupCreateRequest>(event)

  if (!requestData.name || !requestData.orgPk) {
    return newApiResponse(400, "name and orgPk fields are required.");
  }

  const orgData: OrganizationItem = await getOrganizationByPK(requestData.orgPk, tableName);
  if (!orgData.PK) {
    return newApiResponse(404, "Organization not found.");
  }

  // 그룹명 중복체크
  const groupData: Array<GroupItem> = await getGroupList(tableName, requestData.orgPk);
  const group: GroupList = new GroupList(groupData);

  if (group.checkExistByName(requestData.name)) {
    return newApiResponse(400, "Group name already exists.");
  }

  const groupItem: GroupItem = createNewGroupItem(requestData);
  await saveGroup(groupItem, tableName);

  return newApiResponse(200, "Group created successfully");
});
