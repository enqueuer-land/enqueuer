var prettyjson = require('prettyjson');

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
        var options = {
            indent: 6,
            keysColor: "white",
            dashColor: "white"
          };
        console.log(prettyjson.render(this, options));
    }

    public toString(): string {
        return JSON.stringify(this, null, 4);
    }

}