export abstract class Publisher {

    public protocol: string | null = null;
    public payload: string | null = null;
    public prePublishing: string | null = null;

    constructor(publish: any) {
        if (publish) {
            this.protocol = publish.protocol;
            this.payload = publish.payload;
            this.prePublishing = publish.prePublishing;
        }
    }

    public abstract execute(): Promise<void>;

    public createPrePublishingFunction(): Function {
        const fullBody: string =    `let test = {};
                                    let report = {};
                                    let payload = '${this.payload}';
                                    ${this.prePublishing};
                                    return {
                                            test: test,
                                            report: report,
                                            payload: payload
                                     };`;
        return new Function(fullBody);
    }
}