import {InvokeCommand, LambdaClient, LogType} from "@aws-sdk/client-lambda";

export const invoke = async (funcName: string, payload: any) => {
  const client = new LambdaClient({});
  const command = new InvokeCommand({
    FunctionName: funcName,
    Payload: JSON.stringify(payload),
    LogType: LogType.Tail,
  });

  const {Payload, LogResult} = await client.send(command);
  // @ts-ignore
  const result = Buffer.from(Payload).toString();
  // @ts-ignore
  const logs = Buffer.from(LogResult, "base64").toString();
  return {logs, result};
};