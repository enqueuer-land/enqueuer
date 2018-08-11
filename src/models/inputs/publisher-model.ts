export interface PublisherModel {
    type: string;
    onMessageReceived?: string;
    onInit?: string;
    name: string;

    [propName: string]: any;
}