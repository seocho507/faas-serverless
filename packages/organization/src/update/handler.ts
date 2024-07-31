import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from 'aws-lambda';
import {adminApiProxy, newApiResponse} from '../../../../commons/ApiProxy';
import {TransactWriteItemsCommandInput} from '@aws-sdk/client-dynamodb';
import {getAllOrganizationData, OrganizationUpdateRequest} from "../../OrganizationFunction";
import {
  isEmptyArray,
  isNotNullOrEmptyString,
  parseBody
} from "../../../../commons/utils/CommonUtils";
import {
  AllOrganizationItem,
  newAllOrganizationItem,
  OrganizationItem,
  OrganizationList
} from "../../../../commons/items/OrganizationItem";
import {marshall} from "@aws-sdk/util-dynamodb";
import {executeTransactWrite} from "../../../../commons/dynamo/dynamoCommands";
import {NullableString, PK, TableName} from "../../../../commons/type/Types";

const tableName: TableName = process.env.DYNAMODB_TABLE ?? '';

export const putOrganization: APIGatewayProxyHandler = adminApiProxy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const requestData: OrganizationUpdateRequest = parseBody<OrganizationUpdateRequest>(event);
  const pk: PK = requestData.key.pk
  const name: NullableString = requestData.name;
  const description: NullableString = requestData.description;

  if (!pk) {
    return newApiResponse(400, "The 'pk' field is required.");
  }

  const allOrganizationData: Array<OrganizationItem> = await getAllOrganizationData(tableName);
  const organizationList: OrganizationList = new OrganizationList(allOrganizationData);

  if (isEmptyArray(allOrganizationData)) {
    return newApiResponse(404, "Main list not found.");
  }

  const toUpdate: OrganizationItem = organizationList.findByPk(pk);
  organizationList.removeOrganization(pk);
  if (isNotNullOrEmptyString(name)) {
    toUpdate.name = name;
  }
  if (isNotNullOrEmptyString(description)) {
    toUpdate.description = description;
  }
  organizationList.addOrganization(toUpdate);

  const allOrganizationItem: AllOrganizationItem = newAllOrganizationItem(organizationList.getOrganizations());

  const transactItems: TransactWriteItemsCommandInput = {
    TransactItems: [
      {
        Put: {
          TableName: tableName,
          Item: marshall(allOrganizationItem)
        }
      },
      {
        Put: {
          TableName: tableName,
          Item: marshall(toUpdate)
        }
      }
    ]
  };

  await executeTransactWrite(transactItems);
  return newApiResponse(200, "Organization updated successfully");
});
