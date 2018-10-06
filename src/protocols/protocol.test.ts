import {Protocol} from "./protocol";

describe('Protocol', () => {

    it('namesMatchExactly name', () => {
        const match = new Protocol('gui').matches('gui');
        expect(match).toBeTruthy();
    });

    it('namesMatch alternative', () => {
        const match = new Protocol('', ['gui']).matches('gui');
        expect(match).toBeTruthy();
    });

    it('names dont Match alternative', () => {
        const match = new Protocol('', ['']).matches('gui', 100);
        expect(match).toBeFalsy();
    });

    it('isLibraryInstalled', () => {
        // @ts-ignore
        const available = new Protocol('', [], 'express').isLibraryInstalled();
        expect(available).toBeTruthy();
    });

    it('isLibraryInstalled false', () => {
        // @ts-ignore
        const available = new Protocol('', [], 'zero-mq-not-defined-at-least-I-hope').isLibraryInstalled();
        expect(available).toBeFalsy();
    });

    it('no library to suggest', () => {
        const available = new Protocol('', [], ).suggestInstallation();
        expect(available).toBeFalsy();
    });

    it('library to suggest', () => {
        const available = new Protocol('', [], 'express').suggestInstallation();
        expect(available).toBeTruthy();
    });

});