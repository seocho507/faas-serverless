import {marshall} from "@aws-sdk/util-dynamodb";
import {Constants} from "../Constants";
import {PK, SK} from "../type/Types";

export interface OrganizationItem {
  PK: PK;
  SK: SK;
  name: string;
  description: string;
  createdAt: number;
  deletedAt?: number;
}

export interface AllOrganizationItem {
  PK: string;
  SK: string;
  data: Array<OrganizationItem>;
}

export const newAllOrganizationItem = (list: Array<OrganizationItem>): AllOrganizationItem => {
  return {
    PK: Constants.ADMIN,
    SK: Constants.ORG_LIST,
    data: list
  };
}

export class OrganizationList {
  private organizations: Array<OrganizationItem> = [];

  constructor(data?: Array<OrganizationItem>) {
    if (data) {
      this.organizations = data;
    }
  }

  addOrganization(organization: OrganizationItem): void {
    this.organizations.push(organization);
  }

  removeOrganization(pk: PK): void {
    this.organizations = this.organizations.filter(org => org.PK !== pk);
  }

  checkExistByName(name: string): boolean {
    return this.organizations.some(org => org.name === name);
  }

  checkExistByPK(pk: PK): boolean {
    return this.organizations.some(org => org.PK === pk);
  }

  findByPk(pk: PK): OrganizationItem {
    const find = this.organizations.find(org => org.PK === pk);
    if (!find) {
      throw new Error("Organization not found in the list.");
    }
    return find;
  }

  getOrganizations(): Array<OrganizationItem> {
    return this.organizations;
  }

  toDynamoDBList(): DynamoDBList<DynamoObject> {
    return {
      L: this.organizations.map(org => ({M: marshall(org)}))
    };
  }
}