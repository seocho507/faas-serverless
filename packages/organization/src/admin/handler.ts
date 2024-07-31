import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from "aws-lambda";
import {adminApiProxy, apiProxy, newApiResponse} from "../../../../commons/ApiProxy";
import {
  generateAccessToken,
  generateRefreshToken,
  hashPassword,
  verifyPassword,
  refreshToken
} from "../../../../commons/utils/SecurityUtils";
import {Constants} from "../../../../commons/Constants";
import {deleteItem, getItem, putItem} from "../../../../commons/dynamo/dynamoCommands";
import {isString, timestampString} from "../../../../commons/utils/CommonUtils";

interface AdminUserDto {
  email: string;
  password: string;
}

interface LoginSuccessResponse {
  accessToken: string;
  refreshToken: string;
}

interface DeleteAdminUserDto {
  email: string;
}

/**
 * Create a new admin user handler
 */
const tableName: string = process.env.DYNAMODB_TABLE ?? '';

export const createAdmin: APIGatewayProxyHandler = apiProxy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const requestBody: string = event.body ?? '{}';
  const adminUser: AdminUserDto = JSON.parse(requestBody);

  // Check if the email and password are provided
  if (!adminUser.email || !adminUser.password) {
    return newApiResponse(400, "Email and password are required.");
  }

  // Check if the email is already in use
  const emailExistCheckParam = {
    TableName: tableName,
    Key: {
      PK: {S: Constants.ADMIN},
      SK: {S: Constants.USER_PREFIX + adminUser.email}
    }
  };
  const emailExistCheckResult = await getItem(emailExistCheckParam);
  if (emailExistCheckResult.Item) {
    return newApiResponse(400, "Email already in use.");
  }

  // Create the admin user
  const adminUserItem = {
    PK: {S: Constants.ADMIN},
    SK: {S: Constants.USER_PREFIX + adminUser.email},
    email: {S: adminUser.email},
    password: {S: await hashPassword(adminUser.password)},
    createdAt: {N: timestampString()}
  }

  // Save the admin user
  const saveAdminParam = {
    TableName: tableName,
    Item: adminUserItem
  }
  await putItem(saveAdminParam)

  return newApiResponse(200, "Admin created successfully.")
});

/**
 * Admin login handler
 */
export const loginAdmin: APIGatewayProxyHandler = apiProxy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const tableName: string = process.env.DYNAMODB_TABLE ?? '';
  const requestBody: string = event.body ?? '{}';
  const adminUser: AdminUserDto = JSON.parse(requestBody);

  // Check if the email and password are provided
  if (!adminUser.email || !adminUser.password) {
    return newApiResponse(400, "Email and password are required.");
  }

  // Check if the user exists
  const adminExistCheckParam = {
    TableName: tableName,
    Key: {
      PK: {S: Constants.ADMIN},
      SK: {S: Constants.USER_PREFIX + adminUser.email}
    }
  }
  const adminExistCheckResult = await getItem(adminExistCheckParam);
  if (!adminExistCheckResult.Item) {
    return newApiResponse(400, "Invalid email or password.");
  }

  // Check if the password is correct
  const adminUserItem = adminExistCheckResult.Item;
  const hashedPassword = adminUserItem.password.S;

  if (!isString(hashedPassword)) {
    return newApiResponse(500, "Invalid password hash.");
  }

  const passwordMatch = await verifyPassword(adminUser.password, hashedPassword);
  if (!passwordMatch) {
    return newApiResponse(400, "Invalid email or password.");
  }

  // Return success with JWT
  const pk: string = adminUserItem.PK.S ?? '';
  const sk: string = adminUserItem.SK.S ?? '';
  const accessToken: string = generateAccessToken(pk, sk);
  const refreshToken: string = generateRefreshToken(pk, sk);

  const response: LoginSuccessResponse = {
    accessToken,
    refreshToken
  }

  return newApiResponse(200, response);
});

/**
 * Delete an admin user handler
 */
export const deleteAdmin: APIGatewayProxyHandler = adminApiProxy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const tableName: string = process.env.DYNAMODB_TABLE ?? '';
  const requestBody: string = event.body ?? '{}';
  const deleteAdminUser: DeleteAdminUserDto = JSON.parse(requestBody);

  // Check if the email is provided
  if (!deleteAdminUser.email) {
    return newApiResponse(400, "Email is required.");
  }

  // Check if the email exists
  const emailExistCheckParam = {
    TableName: tableName,
    Key: {
      PK: {S: Constants.ADMIN},
      SK: {S: Constants.USER_PREFIX + deleteAdminUser.email}
    }
  };
  const emailExistCheckResult = await getItem(emailExistCheckParam);
  if (!emailExistCheckResult.Item) {
    return newApiResponse(400, "Admin user not found.");
  }

  // Delete the admin user
  const deleteAdminParam = {
    TableName: tableName,
    Key: {
      PK: {S: Constants.ADMIN},
      SK: {S: Constants.USER_PREFIX + deleteAdminUser.email}
    }
  };
  await deleteItem(deleteAdminParam);

  return newApiResponse(200, "Admin deleted successfully.");
});

export const refreshAccessToken: APIGatewayProxyHandler = apiProxy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const requestBody: string = event.body ?? '{}';
  const {refreshToken: providedRefreshToken} = JSON.parse(requestBody);

  if (!providedRefreshToken) {
    return newApiResponse(400, "Refresh token is required.");
  }

  const newAccessToken = refreshToken(providedRefreshToken);
  return newApiResponse(200, {accessToken: newAccessToken});
});
