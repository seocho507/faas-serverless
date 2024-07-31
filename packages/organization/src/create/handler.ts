import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from 'aws-lambda';
import {adminApiProxy, newApiResponse} from "../../../../commons/ApiProxy";
import {OrganizationItem, OrganizationList} from "../../../../commons/items/OrganizationItem";
import {
  createNewOrganizationItem,
  getAllOrganizationData,
  OrganizationCreateRequest,
  saveOrganization
} from "../../OrganizationFunction";
import {parseBody} from "../../../../commons/utils/CommonUtils";
import {TableName} from "../../../../commons/type/Types";

const tableName: TableName = process.env.DYNAMODB_TABLE ?? '';

export const createOrganization: APIGatewayProxyHandler = adminApiProxy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const requestData: OrganizationCreateRequest = parseBody<OrganizationCreateRequest>(event);

  if (!requestData.name) {
    return newApiResponse(400, "The 'name' field is required.");
  }

  const allOrganizationData: Array<OrganizationItem> = await getAllOrganizationData(tableName);
  const organizationList: OrganizationList = new OrganizationList(allOrganizationData);

  if (organizationList.checkExistByName(requestData.name)) {
    return newApiResponse(400, "The 'name' field is duplicated.");
  }

  const organizationItem: OrganizationItem = createNewOrganizationItem(requestData);
  await saveOrganization(organizationItem, organizationList, tableName);

  return newApiResponse(200, "Organization created successfully");
});
