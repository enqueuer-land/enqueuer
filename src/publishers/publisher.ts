export abstract class Publisher {
    public type: string;
    public payload: string;
    public prePublishing: string | null = null;

    constructor(publisherAttributes: any) {
        this.type = publisherAttributes.type;
        this.payload = publisherAttributes.payload;
        this.prePublishing = publisherAttributes.prePublishing;
    }

    public abstract publish(): Promise<void>;
}