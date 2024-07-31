import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from "aws-lambda";
import {adminApiProxy, newApiResponse} from "../../../../commons/ApiProxy";
import {
  findUserByKey,
  findUsersInGroup,
  findUsersInOrganization,
  getGroupsFromUserItem,
  UserGetRequest,
  UsersInGroupGetRequest,
  UsersInOrgGetRequest
} from "../../UserFuctions";
import {UserItem} from "../../../../commons/items/UserItem";
import {convertUsersToDtos, toUserDto} from "../../../../commons/dto/params";
import {GroupItem} from "../../../../commons/items/GroupItem";
import {PK, SK, TableName} from "../../../../commons/type/Types";
import {parseBody} from "../../../../commons/utils/CommonUtils";

const tableName: TableName = process.env.DYNAMODB_TABLE ?? '';

export const getUserById: APIGatewayProxyHandler = adminApiProxy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const requestData: UserGetRequest = parseBody<UserGetRequest>(event)
  const pk: PK = requestData.key.pk;
  const sk: SK = requestData.key.sk

  if (!pk || !sk) {
    return newApiResponse(400, "The 'pk' and 'sk' fields are required.");
  }

  const userItem: UserItem = await findUserByKey(pk, sk, tableName);
  const groupItems: Array<GroupItem> = await getGroupsFromUserItem(userItem, tableName)

  return newApiResponse(200, toUserDto(userItem, groupItems));
});


export const getUserByOrg: APIGatewayProxyHandler = adminApiProxy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const requestData: UsersInOrgGetRequest = parseBody<UsersInOrgGetRequest>(event);
  const orgPk: PK = requestData.orgPk;

  if (!orgPk) {
    return newApiResponse(400, "The 'orgPk' field is required.");
  }

  const users: Array<UserItem> = await findUsersInOrganization(orgPk, tableName);

  return newApiResponse(200, await convertUsersToDtos(users, tableName));
});


export const getUserByGroup: APIGatewayProxyHandler = adminApiProxy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const requestData: UsersInGroupGetRequest = parseBody<UsersInGroupGetRequest>(event);
  const orgPk: PK = requestData.orgPk;
  const groupSk: SK = requestData.groupSk;

  if (!orgPk || !groupSk) {
    return newApiResponse(400, "The 'orgPk' and 'groupSk' fields are required.");
  }

  const users: Array<UserItem> = await findUsersInGroup(orgPk, groupSk, tableName);

  return newApiResponse(200, await convertUsersToDtos(users, tableName));
});
