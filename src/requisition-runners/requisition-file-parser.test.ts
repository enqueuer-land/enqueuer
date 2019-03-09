import {RequisitionFileParser} from './requisition-file-parser';
import * as fs from 'fs';
import {DynamicModulesManager} from '../plugins/dynamic-modules-manager';

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
            id: 12345
        };
        const fileContent: string = JSON.stringify(value);

        // @ts-ignore
        fs.readFileSync.mockImplementationOnce(() => Buffer.from(fileContent));
        const filename = 'anyStuff';

        DynamicModulesManager.getInstance().getObjectParserManager().addObjectParser(() => {
            return {
                parse: () => value
            };
        }, 'some');

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
        }, 'some');

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
            id: 12345
        };
        const fileContent: string = JSON.stringify(value);

        DynamicModulesManager.getInstance().getObjectParserManager().addObjectParser(() => {
            return {
                parse: () => value
            };
        }, 'some');

        // @ts-ignore
        fs.readFileSync.mockImplementationOnce(() => Buffer.from(fileContent));
        const requisition = new RequisitionFileParser('anyStuff').parse();
        expect(requisition.id).toBe(12345);
    });

});
