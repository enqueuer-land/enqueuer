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

    createPrePublishingFunction(): Function {



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