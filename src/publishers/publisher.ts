import {PublisherModel} from "../requisitions/model/publisher-model";

export abstract class Publisher {
    public type: string;
    public payload: string;
    public prePublishing?: string;

    constructor(publisherAttributes: PublisherModel) {
        this.type = publisherAttributes.type;
        this.payload = publisherAttributes.payload;
        this.prePublishing = publisherAttributes.prePublishing;
    }

    public abstract publish(): Promise<void>;
}