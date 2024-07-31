import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from "aws-lambda";
import {adminApiProxy, newApiResponse} from "../../../../commons/ApiProxy";
import {deleteUserByKey, UserDeleteRequest} from "../../UserFuctions";
import {PK, SK, TableName} from "../../../../commons/type/Types";
import {parseBody} from "../../../../commons/utils/CommonUtils";

const tableName: TableName = process.env.DYNAMODB_TABLE ?? '';

export const deleteUsers: APIGatewayProxyHandler = adminApiProxy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const requestData: UserDeleteRequest = parseBody<UserDeleteRequest>(event);
  const pk: PK = requestData.key.pk;
  const sk: SK = requestData.key.sk;

  if (!pk || !sk) {
    return newApiResponse(400, "The 'pk' and 'sk' fields are required.");
  }

  await deleteUserByKey(pk, sk, tableName);

  return newApiResponse(200, "User deleted successfully.");
});
