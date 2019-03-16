import {RequisitionImporter} from './requisition-importer';
import {RequisitionFileParser} from './requisition-file-parser';

let parseFileMock = jest.fn();
jest.mock('./requisition-file-parser');
// @ts-ignore
RequisitionFileParser.mockImplementation(() => {
    return {
        parseFile: parseFileMock

    };
});

describe('RequisitionImporter', () => {
    beforeEach(() => {
        parseFileMock.mockClear();
    });

    it('should return the same if there is no import', () => {
        const requisition = {name: 'name', value: 1234};

        // @ts-ignore
        const imported = new RequisitionImporter().import(requisition);

        expect(imported).toEqual(requisition);
        expect(parseFileMock).not.toHaveBeenCalled();
    });

    it('should throw on error', () => {
        parseFileMock = jest.fn(() => {
            throw 'error';
        });
        const requisition = {import: 'throw file'};

        // @ts-ignore
        expect(() => new RequisitionImporter().import(requisition)).toThrow();
        expect(parseFileMock).toHaveBeenCalledTimes(1);
        expect(parseFileMock).toHaveBeenCalledWith(requisition.import);
    });

    it('should merge requisitions', () => {
        parseFileMock = jest.fn(() => {
            return {
                name: 'imported',
                importedValue: 1234,
            };
        });
        const original = {import: 'file', name: 'original'};

        // @ts-ignore
        const imported = new RequisitionImporter().import(original);

        expect(imported.name).toBe(original.name);
        expect(imported.import).toBe(original.import);
        expect(imported.importedValue).toBe(1234);
    });
});
