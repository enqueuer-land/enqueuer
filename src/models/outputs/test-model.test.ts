import {TestModel, testModelIsPassing} from './test-model';

describe('TestModel', () => {
    it('Valid is passing', () => {
        const test: TestModel = {
            description: '',
            name: '',
            valid: true
        };
        expect(testModelIsPassing(test)).toBeTruthy();
    });

    it('Ignored is passing', () => {
        const test: TestModel = {
            description: '',
            name: '',
            valid: false,
            ignored: true
        };
        expect(testModelIsPassing(test)).toBeTruthy();
    });

    it('Not valid and not ignored is not passingis passing', () => {
        const test: TestModel = {
            description: '',
            name: '',
            valid: false,
            ignored: false
        };
        expect(testModelIsPassing(test)).toBeFalsy();
    });
});
