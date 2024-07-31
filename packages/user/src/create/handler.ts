import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from "aws-lambda";
import {adminApiProxy, newApiResponse} from "../../../../commons/ApiProxy";
import {saveUser, UserCreateRequest} from "../../UserFuctions";
import {GroupItem} from "../../../../commons/items/GroupItem";
import {getGroupsByPKAndSKList} from "../../../group/GroupFunction"
import {parseBody} from "../../../../commons/utils/CommonUtils";
import {TableName} from "../../../../commons/type/Types";

const tableName: TableName = process.env.DYNAMODB_TABLE ?? '';

export const createUsers: APIGatewayProxyHandler = adminApiProxy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const requestData: UserCreateRequest = parseBody<UserCreateRequest>(event);

  if (!requestData.name || !requestData.email || !requestData.password) {
    return newApiResponse(400, "Name, email, and password are required.");
  }

  const groups: GroupItem[] = await getGroupsByPKAndSKList(requestData.orgPk, requestData.groups, tableName);

  if (groups.length !== requestData.groups.length) {
    return newApiResponse(400, "Some groups not found.");
  }

  await saveUser(requestData, tableName);
  return newApiResponse(200, "User created successfully.");
});
