import {AssertionCodeGenerator} from './assertion-code-generator';

describe('AssertionCodeGenerator', () => {

    it('Should throw exception if no label is given', () => {
        const assertionCodeGenerator: AssertionCodeGenerator = new AssertionCodeGenerator('tester');
        expect(() => assertionCodeGenerator.generate({expected: 5, unknown: 3})).toThrow();
    });

    it('Should throw exception if no expected is given', () => {
        const assertionCodeGenerator: AssertionCodeGenerator = new AssertionCodeGenerator('tester');
        expect(() => assertionCodeGenerator.generate({label: 'asa', unknown: 3})).toThrow();
    });

    it('Should throw exception if unknown method is called', () => {
        const assertionCodeGenerator: AssertionCodeGenerator = new AssertionCodeGenerator('tester');
        expect(() => assertionCodeGenerator.generate({label: 'label name', expected: 5, unknown: 3})).toThrow();
    });

    it('Should generate function', () => {
        const assertionCodeGenerator: AssertionCodeGenerator = new AssertionCodeGenerator('tester');

        const code: string = assertionCodeGenerator.generate({label: 'label name', expected: 5, isGreaterThan: 3});
        expect(code).toBe(";tester.isGreaterThan(`label name`, 5, 3);");
    });
});