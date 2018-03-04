import {FunctionCreator} from "./function-creator";

export class PrePublishFunction implements FunctionCreator {

    private publisher: any;

    public constructor(publisher: any) {
        this.publisher = publisher;
    }

    public createFunction(): Function {
        const fullBody: string =    `let test = {};
                                    let report = {};
                                    let publisher = '${this.publisher}';
                                    ${this.publisher.prePublishing};
                                    return {
                                            test: test,
                                            report: report,
                                            publisher: publisher
                                     };`;
        return new Function(fullBody);
    }

}