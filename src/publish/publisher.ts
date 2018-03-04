export abstract class Publisher {

    public protocol: string;
    public payload: string;
    public prePublishing: string | null = null;

    constructor(publish: any) {
        this.protocol = publish.protocol;
        this.payload = publish.payload;
        this.prePublishing = publish.prePublishing;
    }

    public abstract publish(): Promise<void>;
}