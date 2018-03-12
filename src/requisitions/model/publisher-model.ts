export interface PublisherModel {
    type: string;
    prePublishing?: string;

    [propName: string]: any;
}