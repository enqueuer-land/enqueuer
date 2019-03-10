import {ObjectParser} from './object-parser';
import {MainInstance} from '../plugins/main-instance';
import requireFromString from 'require-from-string';

export class FileObjectParserTest implements ObjectParser {
    public parse(value: string): object {
        return value as unknown as object;
    }
}

export function entryPoint(mainInstance: MainInstance): void {
    mainInstance.objectParserManager.addObjectParser(() => new FileObjectParserTest(), 'file');
}
