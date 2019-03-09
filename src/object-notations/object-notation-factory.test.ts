import {ObjectNotationFactory} from './object-notation-factory';
import {Yaml} from './yaml';
import {Json} from './json';
import {Csv} from './csv';

describe('ObjectNotationFactory', () => {

    it('should return undefined', () => {
        expect(new ObjectNotationFactory().create('undefined')).toBeUndefined();
    });

    it('should handle exception', () => {
        // @ts-ignore
        expect(() => new ObjectNotationFactory().create(null)).not.toThrow();
    });

    it('should ignore case', () => {
        expect(new ObjectNotationFactory().create('YaMl')).toBeInstanceOf(Yaml);
    });

    it('should create yml', () => {
        expect(new ObjectNotationFactory().create('yml')).toBeInstanceOf(Yaml);
    });

    it('should create yaml', () => {
        expect(new ObjectNotationFactory().create('yaml')).toBeInstanceOf(Yaml);
    });

    it('should create json', () => {
        expect(new ObjectNotationFactory().create('json')).toBeInstanceOf(Json);
    });

    it('should create csv', () => {
        expect(new ObjectNotationFactory().create('csv____startswith')).toBeInstanceOf(Csv);
    });

    it('should create tsv', () => {
        expect(new ObjectNotationFactory().create('tsv____startswith')).toBeInstanceOf(Csv);
    });

});
