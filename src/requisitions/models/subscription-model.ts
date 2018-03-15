export interface SubscriptionModel {
    type: string;
    onMessageReceived?: string;
    timeout?: number

    [propName: string]: any;
}