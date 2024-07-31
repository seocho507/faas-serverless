import {UserItem} from "../items/UserItem";
import {GroupItem} from "../items/GroupItem";
import {getGroupsFromUserItem} from "../../packages/user/UserFuctions";

/**
 * DTO
 */
export interface OrganizationDto {
  PK: string;
  SK: string;
  name: string;
  description: string;
  groupCount: number;
  userCount: number;
  createdAt: number;
}

export const transformToOrganizationDto = (item: any): OrganizationDto => {
  return {
    PK: item.PK.S,
    SK: item.SK.S,
    name: item.name.S,
    description: item.description.S,
    groupCount: 0,
    userCount: 0,
    createdAt: item.createdAt.N
  }
}

export interface GroupDto {
  PK: string;
  SK: string;
  name: string;
  createdAt: number;
}

export const transformToGroupDto = (item: any): GroupDto => {
  return {
    PK: item.PK.S,
    SK: item.SK.S,
    name: item.name.S,
    createdAt: item.createdAt.N
  }
}

export interface UserDto {
  PK: string;
  SK: string;
  name: string;
  email: string;
  groups: GroupDto[];
  createdAt: number;
}

export interface GroupDto {
  PK: string;
  SK: string;
  createdAt: number;
  name: string;
}

export const transformUserDto = (item: any): UserDto => {
  const parseGroup = (group: any): GroupDto => {
    const groupAttrs = group.M;
    return {
      SK: groupAttrs.SK.S,
      name: groupAttrs.name.S,
      createdAt: Number(groupAttrs.createdAt.N),
      PK: groupAttrs.PK.S
    };
  };

  return {
    PK: item.PK.S,
    SK: item.SK.S,
    name: item.name?.S ?? '',
    email: item.email?.S ?? '',
    groups: item.groups?.L?.map(parseGroup) ?? [],
    createdAt: Number(item.createdAt?.N ?? 0)
  };
};

export const toUserDto = (user: UserItem, groups: GroupItem[]): UserDto => {
  return {
    PK: user.PK,
    SK: user.SK,
    name: user.name,
    email: user.email,
    groups: groups,
    createdAt: user.createdAt
  };
}

export const convertUsersToDtos = async (users: UserItem[], tableName: string): Promise<UserDto[]> => {
  return Promise.all(
      users.map(async (user: UserItem) => {
        const groups: Array<GroupItem> = await getGroupsFromUserItem(user, tableName);
        return toUserDto(user, groups);
      })
  );
};
