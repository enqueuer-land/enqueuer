import {TestCodeGenerator} from './test-code-generator';

describe('TesterCodeGenerator', () => {

    it('Should throw exception if no label is given', () => {
        const testCodeGenerator: TestCodeGenerator = new TestCodeGenerator('tester');
        expect(() => testCodeGenerator.generate({expected: 5, unknown: 3})).toThrow();
    });

    it('Should throw exception if no expected is given', () => {
        const testCodeGenerator: TestCodeGenerator = new TestCodeGenerator('tester');
        expect(() => testCodeGenerator.generate({label: 'asa', unknown: 3})).toThrow();
    });

    it('Should throw exception if unknown method is called', () => {
        const testCodeGenerator: TestCodeGenerator = new TestCodeGenerator('tester');
        expect(() => testCodeGenerator.generate({label: 'label name', expected: 5, unknown: 3})).toThrow();
    });

    it('Should generate toBeGreaterThanFunction', () => {
        const testCodeGenerator: TestCodeGenerator = new TestCodeGenerator('tester');

        const code: string = testCodeGenerator.generate({label: 'label name', expected: 5, toBeGreaterThan: 3});
        expect(code).toBe("tester.toBeGreaterThan(`label name`, 5, 3);");
    });
});