import {Protocol} from "./protocol";
import {Documentation} from "./documentation";

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

    it('namesMatch alternative', () => {
        const match = new Protocol('').addAlternativeName('gui').matches('gui');
        expect(match).toBeTruthy();
    });

    it('names dont Match alternative', () => {
        const match = new Protocol('').addAlternativeName('one', 'two').matches('gui', 0);
        expect(match).toBeFalsy();
    });

    it('isLibraryInstalled', () => {
        const available = new Protocol('').setLibrary('express').isLibraryInstalled();
        expect(available).toBeTruthy();
    });

    it('isLibraryInstalled false', () => {
        const available = new Protocol('').setLibrary('zero-mq-not-defined-at-least-I-hope').isLibraryInstalled();
        expect(available).toBeFalsy();
    });

    it('no library to suggest', () => {
        const available = new Protocol('').suggestInstallation();
        expect(available).toBeFalsy();
    });

    it('library to suggest', () => {
        const available = new Protocol('').setLibrary('express').suggestInstallation();
        expect(available).toBeTruthy();
    });

    it('get property', () => {
        const property = new Protocol('')
            .addAlternativeName('alternativeName')
            .setLibrary('express')
            .setDocumentation(new Documentation())
            .getDescription();
        expect(property).toEqual({
            alternativeNames: ["alternativeName"],
            library: {
                name: "express",
                version: expect.any(String),
                installed: expect.any(Boolean)
            },
            documentation: expect.any(Documentation)
        });
    });

});