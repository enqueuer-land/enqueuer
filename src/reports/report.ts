export type Test = {
    name: string;
    valid: boolean;
}

export class Report {
    public name: string;
    public valid: boolean = true;
    public tests?: Test[] = [];

    constructor(name: string) {
        this.name = name;
    }

    public addTest(title: string, result: boolean) {
        if (!this.tests)
            this.tests = [];
        if (!result)
            this.valid = false;
        this.tests.push({name: title, valid: result});
    }

    public static create(name: string, other: any = {}) {

        const created = new Report(name);
        Object.keys(other).forEach(key => created[key] = other[key]);
        if (other.tests != null)
            created.tests = other.tests;
        return created;
    }

    [propName: string]: any;
}