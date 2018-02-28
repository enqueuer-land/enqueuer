export abstract class SubscriptionAttributes {
    protocol: string = "";
    message: string | null = null;
    timeout: number = -1;
    onMessageReceivedFunctionBody: string | null = null;
    brokerAddress: string = "";
    topic: string = "";
}