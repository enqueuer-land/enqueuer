import { ComponentImporter } from './component-importer';

describe('ComponentImporter', () => {
  it('should return the same if there is no importTask', () => {
    const task = { name: 'name', value: 1234 };

    // @ts-ignore
    const imported = new ComponentImporter().importTask(task);

    expect(imported).toEqual(task);
  });

  it('should throw on not valid', () => {
    const task = { import: 'throw file' };

    // @ts-ignore
    expect(() => new ComponentImporter().importTask(task)).toThrow();
  });

  it('should merge tasks (imported has higher priority)', () => {
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
    const merged = new ComponentImporter().importTask(original);

    expect(merged.name).toBe(imported.name);
    expect(merged.import).toBeDefined();
    expect(merged.onInit!.script).toBe(imported.onInit.script);
    expect(merged.importedValue).toBe(1234);
    expect(merged.iterations).toBe(1);
  });

  it('should merge sensor (imported has higher priority)', () => {
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

    const merged = new ComponentImporter().importSensor(original);

    expect(merged.name).toBe(imported.name);
    expect(merged.import).toBeDefined();
    expect(merged.onInit!.script).toBe(imported.onInit.script);
    expect(merged.importedValue).toBe(1234);
    expect(merged.type).toBe(original.type);
  });

  it('should merge actuator (imported has higher priority)', () => {
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

    const merged = new ComponentImporter().importActuator(original);

    expect(merged.name).toBe(imported.name);
    expect(merged.import).toBeDefined();
    expect(merged.onInit!.script).toBe(imported.onInit.script);
    expect(merged.importedValue).toBe(1234);
    expect(merged.type).toBe(original.type);
  });
});
