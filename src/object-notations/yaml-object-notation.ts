import {ObjectNotation} from './object-notation';
import * as yaml from 'yamljs';

export class YamlObjectNotation extends ObjectNotation {
    public parse(value: string): object {
        return yaml.parse(value);
    }

    public stringify(value: object, space: number = 2): string | undefined {
        try {
            return yaml.stringify(ObjectNotation.decycle(value), 10, space);
        } catch (err) {
            /*nothing*/
        }
    }

    public loadFromFileSync(filename: string): object {
        return yaml.load(filename);
    }

}