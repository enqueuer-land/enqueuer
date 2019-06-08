import {Protocol} from './protocol';

describe('Protocol', () => {

    it('getName', () => {
        const name = 'gui';
        const match = new Protocol(name, undefined).getName();
        expect(match).toBe(name);
    });

    it('namesMatchExactly name', () => {
        const match = new Protocol('gui', undefined).matches('gui');
        expect(match).toBeTruthy();
    });

    it('should ignore case going', () => {
        const match = new Protocol('gui', undefined).matches('GUI');
        expect(match).toBeTruthy();
    });

    it('should ignore case coming', () => {
        const match = new Protocol('GUI', undefined).matches('gui');
        expect(match).toBeTruthy();
    });

    it('namesMatch alternative', () => {
        const match = new Protocol('', undefined,).addAlternativeName('gui').matches('gui');
        expect(match).toBeTruthy();
    });

    it('names dont Match alternative', () => {
        const match = new Protocol('', undefined,).addAlternativeName('one', 'two').matches('gui', 0);
        expect(match).toBeFalsy();
    });

    it('alternative names are unique', () => {
        const match = new Protocol('one', undefined).addAlternativeName('one', 'two').addAlternativeName('two', 'three');
        // @ts-ignore
        expect(match.alternativeNames).toEqual(['one', 'two', 'three']);
    });

    it('isLibraryInstalled', () => {
        // @ts-ignore
        const available = new Protocol('', undefined).setLibrary('express').library.installed;
        expect(available).toBeTruthy();
    });

    it('isLibraryInstalled false', () => {
        const available = new Protocol('', undefined).setLibrary('zero-mq-not-defined-at-least-I-hope').isLibraryInstalled();
        expect(available).toBeFalsy();
    });

    it('get deep property', () => {
        const property = new Protocol('protocol', undefined, {onMessage: ['virgs']})
            .addAlternativeName('alternativeName')
            .setLibrary('express')
            .getDescription();
        expect(property.hookEvents).toEqual({onFinish: [], onInit: [], onMessage: ['virgs']});
    });

    it('get deep with array property', () => {
        const property = new Protocol('protocol', undefined, ['virgs'])
            .addAlternativeName('alternativeName')
            .setLibrary('express')
            .getDescription();
        expect(property.hookEvents).toEqual({onFinish: [], onInit: [], onMessageReceived: ['virgs']});
    });

    it('get deep with nothing', () => {
        const property = new Protocol('protocol', undefined, {})
            .addAlternativeName('alternativeName')
            .setLibrary('express')
            .getDescription();
        expect(property.hookEvents).toEqual({onFinish: [], onInit: []});
    });

});
