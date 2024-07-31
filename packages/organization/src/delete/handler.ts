import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from 'aws-lambda';
import {adminApiProxy, newApiResponse} from "../../../../commons/ApiProxy";
import {
  deleteOrganizationItem,
  getAllOrganizationData,
  getOrganizationByPK,
  OrganizationDeleteRequest
} from "../../OrganizationFunction";
import {isEmptyArray, isEmptyObject, parseBody} from "../../../../commons/utils/CommonUtils";
import {OrganizationItem, OrganizationList} from "../../../../commons/items/OrganizationItem";
import {PK, TableName} from "../../../../commons/type/Types";

const tableName: TableName = process.env.DYNAMODB_TABLE ?? '';

export const deleteOrganization: APIGatewayProxyHandler = adminApiProxy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const requestData: OrganizationDeleteRequest = parseBody<OrganizationDeleteRequest>(event);
  const pk: PK = requestData.key.pk;

  if (!pk) {
    return newApiResponse(400, "The 'pk' field is required.");
  }

  const OneOrganizationResult: OrganizationItem = await getOrganizationByPK(pk, tableName);
  const allOrganizationResult: Array<OrganizationItem> = await getAllOrganizationData(tableName);

  if (isEmptyObject(OneOrganizationResult) || isEmptyArray(allOrganizationResult)) {
    return newApiResponse(404, "Organization not found.");
  }

  const organizationList: OrganizationList = new OrganizationList(allOrganizationResult);
  if (!organizationList.checkExistByPK(pk) && !isEmptyObject(OneOrganizationResult)) {
    return newApiResponse(404, "Organization not found in List, but found in single item.");
  }

  await deleteOrganizationItem(pk, organizationList, tableName);
  return newApiResponse(200, "Organization deleted successfully");
});
