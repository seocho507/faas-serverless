import {marshall} from "@aws-sdk/util-dynamodb";

export interface GroupItem {
  PK: string;
  SK: string;
  name: string;
  createdAt: number;
}

export class GroupList {
  private groups: GroupItem[];

  constructor(groups: GroupItem[]) {
    this.groups = groups;
  }

  checkExistByName(name: string): boolean {
    return this.groups.some(group => group.name === name);
  }

  removeGroup(pk: string, sk: string): void {
    this.groups = this.groups.filter(group => !(group.PK === pk && group.SK === sk));
  }

  toDynamoDBList(): { L: { M: any }[] } {
    return {
      L: this.groups.map(group => ({M: marshall(group)}))
    };
  }
}
