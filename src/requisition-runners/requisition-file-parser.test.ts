import {DynamicModulesManager} from '../plugins/dynamic-modules-manager';
import {YmlObjectParser} from '../object-parser/yml-object-parser';
import * as fs from 'fs';
import {RequisitionFileParser} from './requisition-file-parser';

jest.mock('fs');

describe('RequisitionFileParser', () => {
    beforeEach(() => {
        // @ts-ignore
        delete DynamicModulesManager.instance;

    });

    it('Should parse array as just one', () => {
        const requisitionsInput = [
            {
                onInit: {},
                id: 0
            },
            {
                publishers: [{type: true}],
                name: 'named',
                id: 1
            }
        ];
        DynamicModulesManager.getInstance().getObjectParserManager().addObjectParser(() => {
            return {
                parse: () => requisitionsInput
            };
        }, 'yml');

        const fileContent = JSON.stringify(requisitionsInput);
        // @ts-ignore
        fs.readFileSync.mockImplementationOnce(() => Buffer.from(fileContent));
        const filename = 'anyStuff';

        const requisition = new RequisitionFileParser().parseFile(filename);

        expect(requisition.name).toBe(filename);

        expect(requisition.requisitions[0].id).toBe(requisitionsInput[0].id);
        expect(requisition.requisitions[0].onInit).toEqual(requisitionsInput[0].onInit);

        expect(requisition.requisitions[1].name).toBe(requisitionsInput[1].name);
        expect(requisition.requisitions[1].id).toBe(requisitionsInput[1].id);
        expect(requisition.requisitions[1].publishers).toEqual(requisitionsInput[1].publishers);

    });

    it('Should throw', () => {
        // @ts-ignore
        fs.readFileSync.mockImplementationOnce(() => {
            throw 'error';
        });
        expect(() => new RequisitionFileParser().parseFile('anyStuff')).toThrow();
    });

    it('Should add if file is not yml nor json', () => {
        const notYml = 'foo bar\nfoo: bar';

        DynamicModulesManager.getInstance().getObjectParserManager().addObjectParser(() => {
            return {
                parse: (value) => new YmlObjectParser().parse(value)
            };
        }, 'yml');

        // @ts-ignore
        fs.readFileSync.mockImplementationOnce(() => Buffer.from(notYml));

        try {
            new RequisitionFileParser().parseFile('any');
            expect(true).toBeFalsy();
        } catch (err) {
            expect(err.json).toBeDefined();
            expect(err.yml).toBeDefined();
        }

    });

    it('Should add error if it is not a valid requisition', () => {
        const notYml = 'hey: bar';

        DynamicModulesManager.getInstance().getObjectParserManager().addObjectParser(() => {
            return {
                parse: (value) => new YmlObjectParser().parse(value)
            };
        }, 'yml');

        // @ts-ignore
        fs.readFileSync.mockImplementationOnce(() => Buffer.from(notYml));

        try {
            new RequisitionFileParser().parseFile('any');
            expect(true).toBeFalsy();
        } catch (err) {
            expect(err).toBe(`File 'any' is not a valid requisition. Unable to find: 'onInit', 'onFinish', 'delay', 'requisitions', 'publishers', 'subscriptions' nor 'import'.`);
        }
    });

});
