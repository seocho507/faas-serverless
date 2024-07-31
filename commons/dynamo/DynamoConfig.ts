import {DynamoDBClient} from "@aws-sdk/client-dynamodb";

const dynamoDBClient = new DynamoDBClient({region: "ap-northeast-2"});

export default dynamoDBClient;