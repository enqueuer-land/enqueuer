import {RequisitionImporter} from './requisition-importer';

describe('RequisitionImporter', () => {
    it('should return the same if there is no import', () => {
        const requisition = {name: 'name', value: 1234};

        // @ts-ignore
        const imported = new RequisitionImporter().import(requisition);

        expect(imported).toEqual(requisition);
    });

    it('should throw on not valid', () => {
        const requisition = {import: 'throw file'};

        // @ts-ignore
        expect(() => new RequisitionImporter().import(requisition)).toThrow();
    });

    it('should merge requisitions', () => {
        const original = {
            import: {
                onInit: {},
                name: 'imported',
                importedValue: 1234,
            }, name: 'original'
        };

        // @ts-ignore
        const imported = new RequisitionImporter().import(original);

        expect(imported.name).toBe(original.name);
        expect(imported.import).toBe(original.import);
        expect(imported.importedValue).toBe(1234);
    });
});
