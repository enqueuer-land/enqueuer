import {ObjectParser} from './object-parser';
import * as yaml from 'yamljs';
import {ObjectDecycler} from './object-decycler';
import {MainInstance} from '../plugins/main-instance';

export class YmlObjectParser implements ObjectParser {
    public parse(value: string): object {
        return yaml.parse(value);
    }

    public stringify(value: object, query: any = {}): string {
        const parsedQuery = this.parseQuery(query);
        return yaml.stringify(new ObjectDecycler().decycle(value || {}), parsedQuery.inline, parsedQuery.space);
    }

    private parseQuery(query: any): any {
        return Object.assign({},
            {
                inline: 100,
                space: 2
            },
            query);
    }

}

export function entryPoint(mainInstance: MainInstance): void {
    mainInstance.objectParserManager.addObjectParser(() => new YmlObjectParser(), 'yml', 'yaml');
}
