import {Constants} from "../Constants";
import {v4 as uuidv4} from 'uuid';
import {APIGatewayProxyEvent} from "aws-lambda";
import {NullableString} from "../type/Types";

const base62Chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

const base62Encode = (num: number): string => {
  let encoded = '';
  while (num > 0) {
    encoded = base62Chars[num % 62] + encoded;
    num = Math.floor(num / 62);
  }
  return encoded || '0';
};

// 1000개 기준 충돌 확률 : 100억분의 14
export const generateId = (): string => {
  const uuid = uuidv4().replace(/-/g, '');
  const base62Id = base62Encode(parseInt(uuid.substring(0, 8), 16));
  return base62Id.padStart(8, '0');
};

export const timestampString = (): string => {
  return Date.now().toString();
}

export const timestamp = (): number => {
  return Date.now();
}

export const newOrganizationPK = (): string => {
  return Constants.ORGANIZATION_PREFIX + generateId();
}

export const newUserSK = (): string => {
  return Constants.USER_PREFIX + generateId();
}

export const newGroupSK = (): string => {
  return Constants.GROUP_PREFIX + generateId();
}

export const isString = (value: any): value is string => {
  return typeof value === 'string';
};

export const validateEnvVars = (): void => {
  if (!process.env.DYNAMODB_TABLE) {
    throw new Error("Table name is not defined in the environment variables.");
  }

  if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
    throw new Error("JWT secret is not defined in the environment variables.");
  }
};

export const isNotEmptyDynamoDBList = (data?: DynamoDBList<DynamoObject>): boolean => {
  return data != null && Array.isArray(data.L) && data.L.length > 0;
};

export const isNotEmptyDynamoObject = (data?: DynamoObject): boolean => {
  return data != null && Object.keys(data).length > 0;
};

export const isEmptyObject = (obj: any): boolean => {
  return obj == null || Object.keys(obj).length === 0;
}

export const isEmptyArray = (arr: any[]): boolean => {
  return arr == null || arr.length === 0;
}

export const parseBody = <T>(event: APIGatewayProxyEvent): T => {
  return JSON.parse(event.body ?? '{}') as T;
}

export const isNotNullOrEmptyString = (value: NullableString): value is string => {
  return value !== undefined && value !== null && value.trim() !== '';
}