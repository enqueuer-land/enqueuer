export abstract class Publisher {

    public protocol: string;
    public payload: string;
    public prePublishing: string | null = null;

    constructor(publish: any) {
        this.protocol = publish.protocol;
        this.payload = publish.payload;
        this.prePublishing = publish.prePublishing;
    }

    public abstract publish(publisher: Publisher): Promise<void>;

    public createPrePublishingFunction(): Function {
        const fullBody: string =    `let test = {};
                                    let report = {};
                                    let publisher = '${this}';
                                    ${this.prePublishing};
                                    return {
                                            test: test,
                                            report: report,
                                            publisher: publisher
                                     };`;
        return new Function(fullBody);
    }
}