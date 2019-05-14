import {DynamicModulesManager} from '../plugins/dynamic-modules-manager';
import * as fs from 'fs';
import {RequisitionFileParser} from './requisition-file-parser';
import * as glob from 'glob';

jest.mock('fs');
jest.mock('glob');
// @ts-ignore
glob.sync.mockImplementation((pattern: string) => [pattern]);

describe('RequisitionFileParser', () => {
    beforeEach(() => {
        // @ts-ignore
        delete DynamicModulesManager.instance;

    });

    it('Should parse array as just one', () => {
        const requisitionInput = {
            onInit: {},
            id: 0
        };
        DynamicModulesManager.getInstance().getObjectParserManager().addObjectParser(() => {
            return {
                parse: () => requisitionInput
            };
        }, 'yml');

        const fileContent = JSON.stringify(requisitionInput);
        // @ts-ignore
        fs.readFileSync.mockImplementationOnce(() => Buffer.from(fileContent));
        const filename = 'anyStuff';

        const requisition = new RequisitionFileParser().parseFile(filename);

        expect(requisition.name).toBe(filename);
        expect(requisition.id).toBe(requisitionInput.id);
        expect(requisition.onInit).toEqual(requisitionInput.onInit);
    });

    it('Should throw', () => {
        // @ts-ignore
        fs.readFileSync.mockImplementationOnce(() => {
            throw 'error';
        });
        expect(() => new RequisitionFileParser().parseFile('anyStuff')).toThrow();
    });

});
