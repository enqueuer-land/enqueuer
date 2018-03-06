export abstract class Publisher {
    public protocol: string;
    public payload: string;
    public prePublishing: string | null = null;

    constructor(publisherAttributes: any) {
        this.protocol = publisherAttributes.protocol;
        this.payload = publisherAttributes.payload;
        this.prePublishing = publisherAttributes.prePublishing;
    }

    public abstract publish(): Promise<void>;
}