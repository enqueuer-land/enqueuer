export interface Report {
    valid: boolean;
    name: string;
    errorsDescription?: string[];

    [propName: string]: any;
}