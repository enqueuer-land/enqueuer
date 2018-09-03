import {PublisherModel} from '../models/inputs/publisher-model';
import {Event} from '../events/event';

export abstract class Publisher {
    public type: string;
    public payload: any;
    public name: string;
    public onMessageReceived?: Event;
    public onInit?: Event;
    public onFinish?: Event;
    public messageReceived?: any;

    public constructor(publisherAttributes: PublisherModel) {
        this.type = publisherAttributes.type;
        this.payload = publisherAttributes.payload;
        this.name = publisherAttributes.name;
        this.onInit = publisherAttributes.onInit;
        this.onFinish = publisherAttributes.onFinish;
        this.onMessageReceived = publisherAttributes.onMessageReceived;
    }

    public abstract publish(): Promise<void>;
}