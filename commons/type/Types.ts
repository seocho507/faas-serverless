export type PK = string; // NOSONAR
export type SK = string; // NOSONAR
export type TableName = string; // NOSONAR

export type DynamoKey = {
  pk: PK;
  sk: SK;
};
export type NullableString = string | null | undefined;