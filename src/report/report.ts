const chalk = require('chalk');

export class Report {

    private errorMessages: string[] = [];
    private infoMessages: string[] = [];
    private warningMessages: string[] = [];

    constructor(infoMessages: string[],
                warningMessages: string[], 
                errorMessages: string[]) {
        this.infoMessages = infoMessages;
        this.warningMessages = warningMessages;
        this.errorMessages = errorMessages;
    }

    public print(): void {
        this.printInfo();
        this.printWarnings();
        this.printErrors();
    }

    public hasErrors(): boolean {
        return this.errorMessages.length > 0;
    }

    public toString(): string {
        let clone = (JSON.parse(JSON.stringify(this)));
        clone.hasErrors = this.hasErrors();
        return JSON.stringify(clone, null, 4);
    }

    private printInfo(): void {
        if (this.infoMessages.length == 0)
            return;
        console.log(chalk.underline.green("INFO"));
        this.infoMessages
            .forEach((info: string) => {
                console.log(chalk.green("\t" + info));
            });
    }

    private printWarnings(): void {
        if (this.warningMessages.length == 0)
            return;
        console.log(chalk.underline.yellow("WARNING"));
        this.warningMessages
            .forEach((warning: string) => {
                console.log(chalk.yellow("\t" + warning));
            });
    }

    private printErrors(): void {
        if (this.errorMessages.length == 0)
            return;
        console.log(chalk.underline.red("ERROR"));
        this.errorMessages
            .forEach((error: string) => {
                console.log(chalk.red("\t" + error));
            });
    }

}