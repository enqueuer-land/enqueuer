import {Documentation} from "./documentation";

describe('Documentation', () => {

    it('optional false as default', () => {
        const documentation = new Documentation();
        // @ts-ignore
        expect(documentation.optional).toBeFalsy()
    });

    it('set optional', () => {
        const documentation = new Documentation().setOptional(true);
        // @ts-ignore
        expect(documentation.optional).toBeTruthy();
    });

    it('set description', () => {
        const description = 'description';
        const documentation = new Documentation().setDescription(description);
        // @ts-ignore
        expect(documentation.description).toBe(description);
    });

    it('set example', () => {
        const example = 'example';
        const documentation = new Documentation().setExample(example);
        // @ts-ignore
        expect(documentation.example).toBe(example);
    });

    it('set default value', () => {
        const defaultValue = 'defaultValue';
        const documentation = new Documentation().setDefaultValue(defaultValue);
        // @ts-ignore
        expect(documentation.defaultValue).toBe(defaultValue);
    });

    it('set reference', () => {
        const reference = 'reference';
        const documentation = new Documentation().setReference(reference);
        // @ts-ignore
        expect(documentation.reference).toBe(reference);
    });

    it('add children', () => {
        const documentation = new Documentation();
        expect(documentation.first).toBeUndefined();

        documentation.addChild('first', new Documentation());
        // @ts-ignore
        expect(documentation.first).toBeDefined();
    });

});