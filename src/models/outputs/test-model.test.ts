import {TestModel, testModelIsFailing, testModelIsNotFailing, testModelIsPassing} from './test-model';

describe('TestModel', () => {
    it('Valid is passing', () => {
        const test: TestModel = {
            description: '',
            name: '',
            valid: true
        };
        expect(testModelIsPassing(test)).toBeTruthy();
    });

    it('Ignored is not passing', () => {
        const test: TestModel = {
            description: '',
            name: '',
            valid: false,
            ignored: true
        };
        expect(testModelIsPassing(test)).toBeFalsy();
    });

    it('Valid and ignored is not passing', () => {
        const test: TestModel = {
            description: '',
            name: '',
            valid: true,
            ignored: true
        };
        expect(testModelIsPassing(test)).toBeFalsy();
    });

    it('Not valid and not ignored and not valid is not passing', () => {
        const test: TestModel = {
            description: '',
            name: '',
            valid: false,
            ignored: false
        };
        expect(testModelIsPassing(test)).toBeFalsy();
    });

    it('Valid is not failing', () => {
        const test: TestModel = {
            description: '',
            name: '',
            valid: true
        };
        expect(testModelIsNotFailing(test)).toBeTruthy();
    });

    it('Ignored is not failing', () => {
        const test: TestModel = {
            description: '',
            name: '',
            valid: false,
            ignored: true
        };
        expect(testModelIsNotFailing(test)).toBeTruthy();
    });

    it('Valid and ignored is not passing', () => {
        const test: TestModel = {
            description: '',
            name: '',
            valid: false
        };
        expect(testModelIsNotFailing(test)).toBeFalsy();
    });

    it('Not valid and not ignored is not passing is not failing', () => {
        const test: TestModel = {
            description: '',
            name: '',
            valid: false,
            ignored: false
        };
        expect(testModelIsNotFailing(test)).toBeFalsy();
    });

    it('Not valid and ignored is non failing', () => {
        const test: TestModel = {
            description: '',
            name: '',
            valid: false,
            ignored: true
        };
        expect(testModelIsFailing(test)).toBeFalsy();
    });

    it('Not valid and not ignored is non failing', () => {
        const test: TestModel = {
            description: '',
            name: '',
            valid: false
        };
        expect(testModelIsFailing(test)).toBeTruthy();
    });
});
