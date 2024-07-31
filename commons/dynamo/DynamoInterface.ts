interface DynamoObject {
  [key: string]: any;
}

interface DynamoDBList<T> {
  L: { M: T }[];
}

interface DynamoDBKey {
  pk: string;
  sk: string;
}