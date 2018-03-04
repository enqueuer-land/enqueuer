import {Publisher} from "../publish/publisher";
import {FunctionExecutor} from "./function-executor";

export class PrePublishFunctionExecutor {

    private originalPublisher: Publisher;
    private afterFunctionPublisher: Publisher;

    public constructor(publisher: Publisher) {
        this.originalPublisher = publisher;
        this.afterFunctionPublisher = publisher;
    }

    public execute(): any {
        let publisherExecutor: FunctionExecutor = new FunctionExecutor(this.createPrePublishingFunction());
        this.afterFunctionPublisher = publisherExecutor.execute();
        return {
                failing: publisherExecutor.getFailingTests(),
                passing: publisherExecutor.getPassingTests(),
                exception: publisherExecutor.getException(),
                reports: publisherExecutor.getReports(),
                publisherBeforeFunction: this.originalPublisher,
                publisherAfterFunction: this.afterFunctionPublisher
            }
    }

    private createPrePublishingFunction(): Function {
        const fullBody: string =    `let test = {};
                                    let report = {};
                                    let publisher = '${this.originalPublisher}';
                                    ${this.originalPublisher.prePublishing};
                                    return {
                                            test: test,
                                            report: report,
                                            publisher: publisher
                                     };`;
        return new Function(fullBody);
    }

}