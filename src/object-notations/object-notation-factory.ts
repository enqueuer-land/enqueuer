import {ObjectNotation} from './object-notation';
import {Csv} from './csv';
import {Json} from './json';
import {Yaml} from './yaml';
import {Logger} from '../loggers/logger';

export class ObjectNotationFactory {
    public create(tag: string): ObjectNotation | undefined {
        try {
            const lowerCaseTag = tag.toLowerCase();
            if (lowerCaseTag.startsWith('csv') || lowerCaseTag.startsWith('tsv')) {
                return new Csv(tag);
            } else if (lowerCaseTag === 'json') {
                return new Json();
            } else if (lowerCaseTag === 'yaml' || lowerCaseTag === 'yml') {
                return new Yaml();
            }
        } catch (e) {
            Logger.error(e);
        }
    }
}
