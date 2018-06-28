import {PublisherModel} from '../models/inputs/publisher-model';

export abstract class Publisher {
    public type: string;
    public payload: string;
    public name: string;
    public onMessageReceived?: string;
    public prePublishing?: string;
    public messageReceived?: string;

    public constructor(publisherAttributes: PublisherModel) {
        this.type = publisherAttributes.type;
        this.payload = publisherAttributes.payload;
        this.name = publisherAttributes.name;
        this.prePublishing = publisherAttributes.prePublishing;
        this.onMessageReceived = publisherAttributes.onMessageReceived;
    }

    public abstract publish(): Promise<void>;
}