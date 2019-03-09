import {IdGenerator} from './id-generator';
import {createHash} from 'crypto';
import {DateController} from '../timers/date-controller';
import {JsonObjectParser} from '../object-parser/json-object-parser';

jest.mock('../timers/date-controller');
// @ts-ignore
DateController.mockImplementation(() => {
    return {
        getStringOnlyNumbers: () => {
            return '20180409113740057612';
        }
    };
});

describe('IdGenerator', () => {

    it('generateId', () => {
        const text: string = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
        const hash = createHash('sha256');
        hash.update(text, 'utf8');

        const idGenerator: IdGenerator = new IdGenerator(text);
        const expected = '1137400576_a58dd8680';

        let generatedId = idGenerator.generateId();

        expect(generatedId.substring(0, 20)).toBe(expected);
        expect(generatedId.length).toBeGreaterThan(20);
    });

    it('generateId of objects', () => {
        const value = {
            deep: {
                deeper: {
                    deepest: true
                }
            }
        };
        const hash = createHash('sha256');
        hash.update(new JsonObjectParser().stringify(value), 'utf8');

        const idGenerator: IdGenerator = new IdGenerator(value);
        const expected = '1137400576_f1524b820';

        let generatedId = idGenerator.generateId();

        expect(generatedId.substring(0, 20)).toBe(expected);
        expect(generatedId.length).toBeGreaterThan(20);
    });

});
