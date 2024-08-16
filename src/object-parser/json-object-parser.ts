import {ObjectParser} from './object-parser';
import {ObjectDecycler} from './object-decycler';
import {MainInstance} from '../plugins/main-instance';

export class JsonObjectParser implements ObjectParser {
    public parse(value: string): object {
        return JSON.parse(value);
    }

    public stringify(value: object, query: any = {}): string {
        return JSON.stringify(new ObjectDecycler().decycle(value || {}), null, this.parseQuery(query).space);
    }

    private parseQuery(query: any): any {
        return Object.assign(
            {},
            {
                space: 2
            },
            query
        );
    }
}

export function entryPoint(mainInstance: MainInstance): void {
    mainInstance.objectParserManager.addObjectParser(() => new JsonObjectParser(), 'json');
}
