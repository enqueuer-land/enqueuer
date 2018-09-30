import {ObjectNotation} from './object-notation';
import * as fs from 'fs';
import {YamlObjectNotation} from './yaml-object-notation';
import {JavascriptObjectNotation} from './javascript-object-notation';
import {Logger} from '../loggers/logger';

export class MultipleObjectNotation implements ObjectNotation {

    public parse(value: string): object {
        try {
            return new YamlObjectNotation().parse(value);
        } catch (ymlErr) {
            try {
                return new JavascriptObjectNotation().parse(value);
            } catch (jsonErr) {
                Logger.warning(`Not able to parse as Yaml: ${ymlErr}`);
                Logger.warning(`Not able to parse as Json: ${jsonErr}`);
                throw Error(new JavascriptObjectNotation().stringify({ymlError: ymlErr, jsonError: jsonErr.toString()}));
            }
        }

    }

    public stringify(value: object, space: number = 2): string {
        throw 'MultipleObjectNotation is not able stringify to undefined language';
    }

    public loadFromFileSync(filename: string): object {
        return this.parse(fs.readFileSync(filename).toString());
    }

}