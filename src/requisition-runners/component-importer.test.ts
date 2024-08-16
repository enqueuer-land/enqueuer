import { ComponentImporter } from './component-importer';

describe('ComponentImporter', () => {
  it('should return the same if there is no importRequisition', () => {
    const requisition = { name: 'name', value: 1234 };

    // @ts-ignore
    const imported = new ComponentImporter().importRequisition(requisition);

    expect(imported).toEqual(requisition);
  });

  it('should throw on not valid', () => {
    const requisition = { import: 'throw file' };

    // @ts-ignore
    expect(() => new ComponentImporter().importRequisition(requisition)).toThrow();
  });

  it('should merge requisitions (imported has higher priority)', () => {
    const imported = {
      onInit: {
        script: 'imported'
      },
      name: 'imported',
      importedValue: 1234
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
    const merged = new ComponentImporter().importRequisition(original);

    expect(merged.name).toBe(imported.name);
    expect(merged.import).toBeDefined();
    expect(merged.onInit!.script).toBe(imported.onInit.script);
    expect(merged.importedValue).toBe(1234);
    expect(merged.iterations).toBe(1);
  });

  it('should merge subscription (imported has higher priority)', () => {
    const imported = {
      onInit: {
        script: 'imported'
      },
      name: 'imported',
      importedValue: 1234
    };
    const original = {
      import: imported,
      onInit: {
        script: 'original'
      },
      name: 'original',
      type: 'http'
    };

    const merged = new ComponentImporter().importSubscription(original);

    expect(merged.name).toBe(imported.name);
    expect(merged.import).toBeDefined();
    expect(merged.onInit!.script).toBe(imported.onInit.script);
    expect(merged.importedValue).toBe(1234);
    expect(merged.type).toBe(original.type);
  });

  it('should merge publisher (imported has higher priority)', () => {
    const imported = {
      onInit: {
        script: 'imported'
      },
      name: 'imported',
      importedValue: 1234
    };
    const original = {
      import: imported,
      onInit: {
        script: 'original'
      },
      name: 'original',
      type: 'http'
    };

    const merged = new ComponentImporter().importPublisher(original);

    expect(merged.name).toBe(imported.name);
    expect(merged.import).toBeDefined();
    expect(merged.onInit!.script).toBe(imported.onInit.script);
    expect(merged.importedValue).toBe(1234);
    expect(merged.type).toBe(original.type);
  });
});
