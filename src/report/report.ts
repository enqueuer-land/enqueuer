export class Report {

    private infoMessages: any;
    private publishReports: any;
    private subscriptionReports: any;
    
    constructor(infoMessages: any = {},
        publishReports: any = {},
        subscriptionReports: any = {}) {
            this.infoMessages = infoMessages;
            this.publishReports = publishReports;
            this.subscriptionReports = subscriptionReports;
        }

    public toString(): string {
        return JSON.stringify(this, null, 4);
    }
    
}