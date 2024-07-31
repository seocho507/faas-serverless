export interface UserItem {
  PK: string;
  SK: string;
  createdAt: number;
  name: string;
  email: string;
  password: string;
  groups: string[];
}