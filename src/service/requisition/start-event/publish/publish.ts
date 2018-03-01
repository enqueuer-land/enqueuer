export abstract class Publish {

    protocol: string | null = null;
    payload: string | null = null;
    prePublishing: string | null = null;

    constructor(publish: any) {
        if (publish) {
            this.protocol = publish.protocol;
            this.payload = publish.payload;
            this.prePublishing = publish.prePublishing;
        }
    }

    abstract execute(): Promise<Publish>;

    createPrePublishingFunction(): Function | null {
        if (this.prePublishing == null)
            return null;

        const fullBody: string = `${this.prePublishing};`;
        return new Function('message', fullBody);
    }
}