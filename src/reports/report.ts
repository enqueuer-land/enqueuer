export interface Report {
    valid: boolean;
    errorsDescription: string[];

    [propName: string]: any;
}