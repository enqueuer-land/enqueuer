import {RequisitionFileParser} from './requisition-file-parser';
import * as fs from 'fs';
import {DynamicModulesManager} from '../plugins/dynamic-modules-manager';
import {YmlObjectParser} from '../object-parser/yml-object-parser';

jest.mock('fs');

describe('RequisitionFileParser', () => {
    beforeEach(() => {
        // @ts-ignore
        delete DynamicModulesManager.instance;
    });

    it('Should throw invalid file', () => {
        // @ts-ignore
        fs.readFileSync.mockImplementationOnce(() => {
            throw 'error';
        });
        const parser: RequisitionFileParser = new RequisitionFileParser('anyStuff');

        expect(() => parser.parse()).toThrow();
    });

    it('Should set default name', () => {
        const value = {
            id: 12345,
            onFinish: {}
        };
        const fileContent: string = JSON.stringify(value);

        // @ts-ignore
        fs.readFileSync.mockImplementationOnce(() => Buffer.from(fileContent));
        const filename = 'anyStuff';

        DynamicModulesManager.getInstance().getObjectParserManager().addObjectParser(() => {
            return {
                parse: () => value
            };
        }, 'yml');

        const parser: RequisitionFileParser = new RequisitionFileParser(filename);

        expect(parser.parse().name).toBe(filename);
    });

    it('Should parse array as just one', () => {
        const requisitions = [
            {
                id: 0
            },
            {
                name: 'named',
                id: 1
            }
        ];
        DynamicModulesManager.getInstance().getObjectParserManager().addObjectParser(() => {
            return {
                parse: () => requisitions
            };
        }, 'yml');

        const fileContent = JSON.stringify(requisitions);
        // @ts-ignore
        fs.readFileSync.mockImplementationOnce(() => Buffer.from(fileContent));
        const filename = 'anyStuff';

        const requisition = new RequisitionFileParser(filename).parse();

        expect(requisition.name).toBe(filename);
        expect(requisition.requisitions![0].name).toBe(`Requisition #0`);
        expect(requisition.requisitions![1].name).toBe(`named`);
    });

    it('Should keep initial id', () => {
        const value = {
            id: 12345,
            requisitions: [{}]
        };
        const fileContent: string = JSON.stringify(value);

        DynamicModulesManager.getInstance().getObjectParserManager().addObjectParser(() => {
            return {
                parse: () => value
            };
        }, 'yml');

        // @ts-ignore
        fs.readFileSync.mockImplementationOnce(() => Buffer.from(fileContent));
        const requisition = new RequisitionFileParser('anyStuff').parse();
        expect(requisition.id).toBe(12345);
    });

    it('Should throw if not yml nor json', () => {
        const notYml = 'foo bar\nfoo: bar';

        DynamicModulesManager.getInstance().getObjectParserManager().addObjectParser(() => {
            return {
                parse: (value) => new YmlObjectParser().parse(value)
            };
        }, 'yml');

        // @ts-ignore
        fs.readFileSync.mockImplementationOnce(() => Buffer.from(notYml));
        try {
            new RequisitionFileParser('anyStuff').parse();
            expect(false).toBeTruthy();
        } catch (err) {
            expect(err.json).toBeDefined();
            expect(err.yml).toBeDefined();
        }
    });

    it('Should throw if it is not a valid requisition', () => {
        const notYml = 'hey: bar';

        DynamicModulesManager.getInstance().getObjectParserManager().addObjectParser(() => {
            return {
                parse: (value) => new YmlObjectParser().parse(value)
            };
        }, 'yml');

        // @ts-ignore
        fs.readFileSync.mockImplementationOnce(() => Buffer.from(notYml));
        try {
            new RequisitionFileParser('anyStuff').parse();
            expect(false).toBeTruthy();
        } catch (err) {
            expect(err).toBeDefined();
        }
    });

});
