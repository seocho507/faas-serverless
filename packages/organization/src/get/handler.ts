import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from 'aws-lambda';
import {adminApiProxy, apiProxy, newApiResponse} from "../../../../commons/ApiProxy";
import {
  getAllOrganizationData,
  getOrganizationByPK,
  OrganizationGetRequest
} from "../../OrganizationFunction";
import {getGroupCount} from "../../../group/GroupFunction";
import {getUserCount} from "../../../user/UserFuctions";
import {OrganizationDto} from "../../../../commons/dto/params";
import {PK, TableName} from "../../../../commons/type/Types";
import {parseBody} from "../../../../commons/utils/CommonUtils";

const tableName: TableName = process.env.DYNAMODB_TABLE ?? '';

export const getAllOrganizations: APIGatewayProxyHandler = apiProxy(async (): Promise<APIGatewayProxyResult> => {
  const organizations = await getAllOrganizationData(tableName);

  const organizationsWithCounts: OrganizationDto[] = await Promise.all(
      organizations.map(async (org) => {
        const [groupCount, userCount] = await Promise.all([
          getGroupCount(tableName, org.PK),
          getUserCount(tableName, org.PK)
        ]);

        return {
          ...org,
          groupCount,
          userCount
        } as OrganizationDto;
      })
  );

  return newApiResponse(200, organizationsWithCounts);
});


export const getOrganizationById: APIGatewayProxyHandler = adminApiProxy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const requestBody: OrganizationGetRequest = parseBody<OrganizationGetRequest>(event);
  const pk: PK = requestBody.key.pk;
  if (!pk) {
    return newApiResponse(400, "The 'pk' field is required.");
  }
  return newApiResponse(200, await getOrganizationByPK(pk, tableName));
});
