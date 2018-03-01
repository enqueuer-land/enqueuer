export class Report {

    private infoMessages: any;
    private startEventReports: any;
    private subscriptionReports: any;
    
    constructor(infoMessages: any = {},
                startEventReports: any = {},
                subscriptionReports: any = {}) {
            this.infoMessages = infoMessages;
            this.startEventReports = startEventReports;
            this.subscriptionReports = subscriptionReports;
        }

    public toString(): string {
        return JSON.stringify(this, null, 4);
    }
    
}