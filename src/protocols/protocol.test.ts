import {Protocol} from "./protocol";

describe('Protocol', () => {

    it('getName', () => {
        const name = 'gui';
        const match = new Protocol(name).getName();
        expect(match).toBe(name);
    });

    it('namesMatchExactly name', () => {
        const match = new Protocol('gui').matches('gui');
        expect(match).toBeTruthy();
    });

    it('should ignore case going', () => {
        const match = new Protocol('gui').matches('GUI');
        expect(match).toBeTruthy();
    });

    it('should ignore case coming', () => {
        const match = new Protocol('GUI').matches('gui');
        expect(match).toBeTruthy();
    });

    it('namesMatch alternative', () => {
        const match = new Protocol('').addAlternativeName('gui').matches('gui');
        expect(match).toBeTruthy();
    });

    it('names dont Match alternative', () => {
        const match = new Protocol('').addAlternativeName('one', 'two').matches('gui', 0);
        expect(match).toBeFalsy();
    });

    it('alternative names are unique', () => {
        const match = new Protocol('one').addAlternativeName('one', 'two').addAlternativeName('two', 'three');
        // @ts-ignore
        expect(match.alternativeNames).toEqual(["one", "two", "three"]);
    });

    it('isLibraryInstalled', () => {
        // @ts-ignore
        const available = new Protocol('').setLibrary('express').library.installed;
        expect(available).toBeTruthy();
    });

    it('isLibraryInstalled false', () => {
        const available = new Protocol('').setLibrary('zero-mq-not-defined-at-least-I-hope').isLibraryInstalled();
        expect(available).toBeFalsy();
    });

    it('get property', () => {
        const property = new Protocol('protocol')
            .addAlternativeName('alternativeName')
            .setLibrary('express')
            .getDescription();
        expect(property).toEqual({
            name: 'protocol',
            alternativeNames: ["alternativeName"],
            library: {
                name: "express",
                installed: expect.any(Boolean)
            }
        });
    });

});
