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

    it('should merge requisitions (imported has higher priority)', () => {
        const imported = {
            onInit: {
                script: 'imported'
            },
            name: 'imported',
            importedValue: 1234,
        };
        const original = {
            import: imported,
            onInit: {
                script: 'original'
            },
            name: 'original',
            iterations: 1
        };

        // @ts-ignore
        const merged = new RequisitionImporter().import(original);

        expect(merged.name).toBe(imported.name);
        expect(merged.import).toBeDefined();
        expect(merged.onInit!.script).toBe(imported.onInit.script);
        expect(merged.importedValue).toBe(1234);
        expect(merged.iterations).toBe(1);
    });
});
