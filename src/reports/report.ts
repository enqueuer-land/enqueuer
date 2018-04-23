export class Report {
    public name: string;
    public valid: boolean = true;
    public errorsDescription: string[] = [];

    constructor(name: string) {
        this.name = name;
    }

    [propName: string]: any;
}