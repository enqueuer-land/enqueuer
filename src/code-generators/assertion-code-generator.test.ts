import {AssertionCodeGenerator} from './assertion-code-generator';

describe('AssertionCodeGenerator', () => {

    it('Should pass tester instance name', () => {
        const assertionCodeGenerator: AssertionCodeGenerator = new AssertionCodeGenerator('testerInstanceName');
        const code: string = assertionCodeGenerator.generate({name: 5});

        expect(code).toBe(";testerInstanceName.addTest({\n" +
            "                    errorDescription: `Tester class does not work with '0' arguments function'`,\n" +
            "                    valid: false,\n" +
            "                    label: 'Assertion identified'\n" +
            "                });");
    });

    it('Should add error if num arguments is less than 2', () => {
        const assertionCodeGenerator: AssertionCodeGenerator = new AssertionCodeGenerator('tester');
        const code: string = assertionCodeGenerator.generate({name: 5});

        expect(code).toBe(";tester.addTest({\n" +
            "                    errorDescription: `Tester class does not work with '0' arguments function'`,\n" +
            "                    valid: false,\n" +
            "                    label: 'Assertion identified'\n" +
            "                });");
    });

    it('Should add error if num arguments is greater than 4', () => {
        const assertionCodeGenerator: AssertionCodeGenerator = new AssertionCodeGenerator('tester');
        const code: string = assertionCodeGenerator.generate({name: 5, name1: 5, name2: 5, name3: 5, name4: 5});

        expect(code).toBe(";tester.addTest({\n" +
            "                    errorDescription: `Tester class does not work with '4' arguments function'`,\n" +
            "                    valid: false,\n" +
            "                    label: 'Assertion identified'\n" +
            "                });");
    });

    it('Should add error if no two method method is found', () => {
        const assertionCodeGenerator: AssertionCodeGenerator = new AssertionCodeGenerator('tester');
        const code: string = assertionCodeGenerator.generate({name: 5, unknown: 3});

        expect(code).toBe(";tester.addTest({\n" +
            "                    errorDescription: `Tester class does not recognize the pattern '[\"unknown\"]'`,\n" +
            "                    valid: false,\n" +
            "                    label: 'Known assertion method'\n" +
            "                });");
    });

    it('Should add error if no three method method is found', () => {
        const assertionCodeGenerator: AssertionCodeGenerator = new AssertionCodeGenerator('tester');
        const code: string = assertionCodeGenerator.generate({name: 5, expect: 3, third: 3});

        expect(code).toBe(";tester.addTest({\n" +
            "                    errorDescription: `Tester class does not recognize the pattern '[\"expect\",\"third\"]'`,\n" +
            "                    valid: false,\n" +
            "                    label: 'Known assertion method'\n" +
            "                });");
    });

    it('Should add error if no expected is passed in a three method method', () => {
        const assertionCodeGenerator: AssertionCodeGenerator = new AssertionCodeGenerator('tester');
        const code: string = assertionCodeGenerator.generate({name: 5, unknown: 3, third: 3});

        expect(code).toBe(";tester.addTest({\n" +
            "                    errorDescription: `Error: Test has to have a 'expect' field'`,\n" +
            "                    valid: false,\n" +
            "                    label: 'Required field not found'\n" +
            "                });");
    });

    it('Should generate 2 arguments function', () => {
        const assertionCodeGenerator: AssertionCodeGenerator = new AssertionCodeGenerator('tester');

        const code: string = assertionCodeGenerator.generate({name: 'label name', expect: 5, toBeGreaterThan: 3});
        expect(code).toBe(";   try {\n" +
            "                            tester.toBeGreaterThan(`label name`, 5, 3);\n" +
            "                        } catch (err) {\n" +
            "                        tester.addTest({\n" +
            "                            errorDescription: `Error executing assertion: '${err}'`,\n" +
            "                            valid: false,\n" +
            "                            label: 'Assertion code valid'\n" +
            "                        });\n" +
            "                    }");
    });

    it('Should generate 1 arguments function', () => {
        const assertionCodeGenerator: AssertionCodeGenerator = new AssertionCodeGenerator('tester');

        const code: string = assertionCodeGenerator.generate({name: 'label name', expectToBeDefined: 'varName'});
        expect(code).toBe(";   try {\n" +
            "                            tester.expectToBeDefined(`label name`, varName);\n" +
            "                        } catch (err) {\n" +
            "                        tester.addTest({\n" +
            "                            errorDescription: `Error executing assertion: '${err}'`,\n" +
            "                            valid: false,\n" +
            "                            label: 'Assertion code valid'\n" +
            "                        });\n" +
            "                    }");
    });
});