import {Publish} from "../requisition/start-event/publish/publish";

export class PublisherHandler {
    private publisher: Publish;
    private report: any = {};

    constructor(publisher: Publish) {
        this.publisher = publisher;
    }

    public publish(): Promise<Publish> {
        return new Promise((resolve, reject) => {
            this.publisher.execute()
                .then((publisher: Publish) => {
                    this.generateSuccessfulReport(publisher);
                    resolve();
                })
                .catch((err: any) => {
                this.generateErrorReport(err);
                    reject(err)
                });
        });
    }

    public getReport(): any {
        return this.report;
    }

    private generateErrorReport(publisher: Publish): void {
        this.report = {
            ...publisher,
            timestamp: new Date()
        }
    }

    private generateSuccessfulReport(error: any): void {
        this.report = {
            errorMessage: error,
            timestamp: new Date()
        }
    }

}