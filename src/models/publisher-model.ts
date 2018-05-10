export interface PublisherModel {
    type: string;
    onMessageReceived?: string;
    prePublishing?: string;
    name: string;

    [propName: string]: any;
}