import {PublisherModel} from "../models/publisher-model";

export abstract class Publisher {
    public type: string;
    public payload: string;
    public name: string;
    public prePublishing?: string;

    constructor(publisherAttributes: PublisherModel) {
        this.type = publisherAttributes.type;
        this.payload = publisherAttributes.payload;
        this.name = publisherAttributes.name;
        this.prePublishing = publisherAttributes.prePublishing;
    }

    public abstract publish(): Promise<void>;
}