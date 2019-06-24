import {HookModel} from './hook-model';

export interface ReportModel {
    name: string;
    valid: boolean;
    ignored?: boolean;

    hooks?: {
        [name: string]: HookModel
    };

    [propName: string]: any;
}
