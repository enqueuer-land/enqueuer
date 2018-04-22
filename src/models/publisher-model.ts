export interface PublisherModel {
    type: string;
    prePublishing?: string;
    name: string;

    [propName: string]: any;
}