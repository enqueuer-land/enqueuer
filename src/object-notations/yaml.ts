import {ObjectNotation} from './object-notation';
import * as yaml from 'yamljs';
import {ObjectDecycler} from './object-decycler';
import {Injectable} from 'conditional-injector';

@Injectable({predicate: (type: string) => type.toLowerCase() === 'yml' || type.toLowerCase() === 'yaml'})
export class Yaml extends ObjectNotation {
    public parse(value: string): object {
        return yaml.parse(value);
    }

    public stringify(value: object, space: number = 2): string {
        return yaml.stringify(new ObjectDecycler().decycle(value || {}), 100, space);
    }

    public loadFromFileSync(filename: string): object {
        return yaml.load(filename);
    }

}
