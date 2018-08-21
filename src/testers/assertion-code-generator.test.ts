import {AssertionCodeGenerator} from './assertion-code-generator';

describe('AssertionCodeGenerator', () => {

    it('Should throw exception if no name is given', () => {
        const assertionCodeGenerator: AssertionCodeGenerator = new AssertionCodeGenerator('tester');
        expect(() => assertionCodeGenerator.generate({name: 5, unknown: 3})).toThrow();
    });

    it('Should throw exception if no expected is given', () => {
        const assertionCodeGenerator: AssertionCodeGenerator = new AssertionCodeGenerator('tester');
        expect(() => assertionCodeGenerator.generate({name: 'asa', unknown: 3})).toThrow();
    });

    it('Should throw exception if unknown method is called', () => {
        const assertionCodeGenerator: AssertionCodeGenerator = new AssertionCodeGenerator('tester');
        expect(() => assertionCodeGenerator.generate({name: 'label name', expected: 5, unknown: 3})).toThrow();
    });

    it('Should generate 2 arguments function', () => {
        const assertionCodeGenerator: AssertionCodeGenerator = new AssertionCodeGenerator('tester');

        const code: string = assertionCodeGenerator.generate({name: 'label name', expected: 5, isGreaterThan: 3});
        expect(code).toBe(";tester.isGreaterThan(`label name`, 5, 3);");
    });

    it('Should generate 1 arguments function', () => {
        const assertionCodeGenerator: AssertionCodeGenerator = new AssertionCodeGenerator('tester');

        const code: string = assertionCodeGenerator.generate({name: 'label name', isDefined: 'varName'});
        expect(code).toBe(";tester.isDefined(`label name`, varName);");
    });
});