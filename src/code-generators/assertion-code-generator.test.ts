import { AssertionCodeGenerator } from './assertion-code-generator';

describe('AssertionCodeGenerator', () => {
    it('Should pass tests instance name', () => {
        const assertionCodeGenerator: AssertionCodeGenerator = new AssertionCodeGenerator(
            'tests',
            'asserter',
            'assertion'
        );
        const code: string = assertionCodeGenerator.generate();

        expect(code).toBe(
            'try {\n' +
                '            const evaluated = {name: assertion.name};\n' +
                '            (Object.keys(assertion) || [])\n' +
                "                .filter(key => key !== 'name')\n" +
                '                .forEach(key =>       evaluated[key] = eval(assertion[key])   );\n' +
                '            const testResult = asserter.assert(evaluated, assertion);\n' +
                '            if (assertion.ignore !== undefined && assertion.ignore !== false) {\n' +
                '                testResult.ignored = true;\n' +
                '            }\n' +
                '            tests.push(testResult);\n' +
                '        } catch (err) {\n' +
                "            const msg = `Error executing assertion: '${err}'`;\n" +
                '            Logger.error(msg);\n' +
                '            tests.push({\n' +
                '                name: assertion.name,\n' +
                '                description: msg,\n' +
                '                valid: false\n' +
                '            });\n' +
                '        }'
        );
    });
});
