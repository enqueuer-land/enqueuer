import { Report } from "./report";

export class ReportGenerator {
    private infoMessages: string[] = [];
    private warningMessages: string[] = [];
    private errorMessages: string[] = [];
    
    public addInfo(infoMessage: string): void {
        this.infoMessages.push(infoMessage);
    }
    
    public addWarning(warningMessage: string): void {
        this.warningMessages.push(warningMessage);
    }
    
    public addError(errorMessage: string): void {
        
        this.errorMessages.push(errorMessage);
    }

    public generate(): Report {
        return new Report(this.infoMessages,
                            this.warningMessages, 
                            this.errorMessages);
    }

}