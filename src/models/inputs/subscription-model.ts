export interface SubscriptionModel {
    type: string;
    name: string;
    onMessageReceived?: string;
    timeout?: number;

    [propName: string]: any;
}