export interface SubscriptionModel {
    type: string;
    name: string;
    onMessageReceived?: string;
    onInit?: string;
    response?: any;
    timeout?: number;

    [propName: string]: any;
}