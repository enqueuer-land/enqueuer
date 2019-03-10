import {RequisitionFileParser} from './requisition-file-parser';
import {DynamicModulesManager} from '../plugins/dynamic-modules-manager';
import {YmlObjectParser} from '../object-parser/yml-object-parser';
import * as fs from 'fs';
import * as glob from 'glob';

jest.mock('fs');
jest.mock('glob');

describe('RequisitionFileParser', () => {
    beforeEach(() => {
        // @ts-ignore
        delete DynamicModulesManager.instance;

        glob.sync.mockImplementationOnce((pattern: string) => [pattern]);
    });

    it('Should add invalid file error', () => {
        // @ts-ignore
        fs.readFileSync.mockImplementationOnce(() => {
            throw 'error';
        });
        const parser: RequisitionFileParser = new RequisitionFileParser(['anyStuff']);

        parser.parse();

        expect(parser.getFilesErrors()[0]).toEqual({'description': 'error', 'name': "Error parsing file 'anyStuff'", 'valid': false});
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

        const parser: RequisitionFileParser = new RequisitionFileParser([filename]);

        expect(parser.parse()[0].name).toBe(filename);
    });

    it('Should parse array as just one', () => {
        const requisitionsInput = [
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
                parse: () => requisitionsInput
            };
        }, 'yml');

        const fileContent = JSON.stringify(requisitionsInput);
        // @ts-ignore
        fs.readFileSync.mockImplementationOnce(() => Buffer.from(fileContent));
        const filename = 'anyStuff';

        const parser = new RequisitionFileParser([filename]);
        const requisitions = parser.parse();

        expect(requisitions[0].name).toBe(filename);
        expect(requisitions[0].requisitions![0].name).toBe(`Requisition #0`);
        expect(requisitions[0].requisitions![1].name).toBe(`named`);
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
        const requisitions = new RequisitionFileParser(['anyStuff']).parse();
        expect(requisitions[0].id).toBe(12345);
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

        const parser = new RequisitionFileParser(['anyStuff']);
        parser.parse();

        const parsedErrorDescription: any = parser.getFilesErrors()[0].description;
        expect(parsedErrorDescription.json).toBeDefined();
        expect(parsedErrorDescription.yml).toBeDefined();
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

        const parser = new RequisitionFileParser(['anyStuff']);
        parser.parse();

        expect(parser.getFilesErrors()[0]).toEqual({
            'description': 'File anyStuff is not a valid requisition. ' +
                "Unable to find: 'onInit', 'onFinish', 'requisitions', 'publishers' nor 'subscriptions'",
            'name': "Error parsing file 'anyStuff'",
            'valid': false
        });
    });

    it('should add every not matching file to error', () => {
        glob.sync.mockReset();
        glob.sync.mockImplementationOnce(() => []);

        const parser = new RequisitionFileParser(['not-matching-pattern']);
        parser.parse();

        expect(parser.getFilesErrors()[0]).toEqual({
            'description': "No file was found with: 'not-matching-pattern'",
            'name': "No file was found with: 'not-matching-pattern'",
            'valid': false
        });
    });

});
