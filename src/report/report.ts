// const chalk = require('chalk');

export class Report {

    private infoMessages: string[] = [];
    private publishReports: any[] = [];
    private subscriptionReports: any[] = [];
    private errors: string[] = [];
    
    constructor(infoMessages: string[],
        errors: string[],
        publishReports: any[],
        subscriptionReports: any[]) {
            this.infoMessages = infoMessages;
            this.publishReports = publishReports;
            this.subscriptionReports = subscriptionReports;
            this.errors = errors;
        }
        
    public print(): any {
        throw new Error("Method not implemented.");
    }

    public toString(): string {
        return JSON.stringify(this, null, 4);
    }

}