import {ObjectParser} from './object-parser';
import * as yaml from 'yamljs';
import {ObjectDecycler} from './object-decycler';
import {MainInstance} from '../plugins/main-instance';

export class YmlObjectParser implements ObjectParser {
    public parse(value: string): object {
        return yaml.parse(value);
    }

    public stringify(value: object, params: any = {}): string {
        const parsedParams = this.parseParams(params);
        return yaml.stringify(new ObjectDecycler().decycle(value || {}), parsedParams.inline, parsedParams.space);
    }

    private parseParams(params: any): any {
        return Object.assign({},
            {
                inline: 100,
                space: 2
            },
            params);
    }

}

export function entryPoint(mainInstance: MainInstance): void {
    mainInstance.objectParserManager.addObjectParser(() => new YmlObjectParser(), 'yml', 'yaml');
}
