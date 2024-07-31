import {AllOrganizationItem, OrganizationItem} from "./items/OrganizationItem";
import {GroupItem} from "./items/GroupItem";
import {UserItem} from "./items/UserItem";

export const Constants = {
  KEY_DELIMITER: "#",
  ORGANIZATION_PREFIX: "ORG#",
  USER_PREFIX: "USER#",
  GROUP_PREFIX: "GROUP#",
  ADMIN: "ADMIN",
  USER: "USER",
  ORG: "ORG",
  ORG_LIST: "ORG_LIST",
  EMPTY_LIST: [],

  // JWT
  LIST: "LIST",
  ACCESS_TOKEN_EXPIRATION: '1d',

  REFRESH_TOKEN_EXPIRATION: '7d',

  // Entity
  EMPTY_ORGANIZATION_ITEM: {} as OrganizationItem,
  EMPTY_ALL_ORGANIZATION_ITEM: {} as AllOrganizationItem,

  EMPTY_GROUP_ITEM: {} as GroupItem,

  EMPTY_USER_ITEM: {} as UserItem,

  // DynamoDB
  EMPTY_DYNAMO_LIST: {
    data: {
      L: []
    }
  },

  EMPTY_DYNAMO_OBJECT: {} as DynamoObject
}
