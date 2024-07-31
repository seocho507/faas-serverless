import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from "aws-lambda";
import {adminApiProxy, newApiResponse} from "../../../../commons/ApiProxy";
import {putItem} from "../../../../commons/dynamo/dynamoCommands";
import {hashPassword} from "../../../../commons/utils/SecurityUtils";
import {UserItem} from "../../../../commons/items/UserItem";
import {findUserByKey, UserUpdateRequest} from "../../UserFuctions";
import {marshall} from "@aws-sdk/util-dynamodb";
import {isNotNullOrEmptyString, parseBody} from "../../../../commons/utils/CommonUtils";
import {PK, SK, TableName} from "../../../../commons/type/Types";

const tableName: TableName = process.env.DYNAMODB_TABLE ?? '';

export const updateUser: APIGatewayProxyHandler = adminApiProxy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const requestData: UserUpdateRequest = parseBody<UserUpdateRequest>(event);
  const pk: PK = requestData.key.pk;
  const sk: SK = requestData.key.sk;
  const groups: SK[] | undefined = requestData.groups;

  if (!pk || !sk) {
    return newApiResponse(400, "The 'pk' and 'sk' fields are required.");
  }

  const toUpdate: UserItem = await findUserByKey(pk, sk, tableName);
  if (isNotNullOrEmptyString(requestData.name)) {
    toUpdate.name = requestData.name;
  }
  if (isNotNullOrEmptyString(requestData.email)) {
    toUpdate.email = requestData.email;
  }
  if (isNotNullOrEmptyString(requestData.password)) {
    toUpdate.password = await hashPassword(requestData.password);
  }
  if (groups !== undefined && groups !== null && Array.isArray(groups)) {
    toUpdate.groups = groups;
  }

  const updateUserParams = {
    TableName: tableName,
    Item: marshall(toUpdate)
  };
  await putItem(updateUserParams);
  return newApiResponse(200, "User updated successfully.");
});
