import {ObjectParser} from './object-parser';
import {MainInstance} from '../plugins/main-instance';

export class FileObjectParser implements ObjectParser {
    public parse(value: string): object {
        return value as unknown as object;
    }
}

export function entryPoint(mainInstance: MainInstance): void {
    mainInstance.objectParserManager.addObjectParser(() => new FileObjectParser(), 'file');
}
