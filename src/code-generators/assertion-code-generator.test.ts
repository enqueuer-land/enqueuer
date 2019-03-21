import {AssertionCodeGenerator} from './assertion-code-generator';

describe('AssertionCodeGenerator', () => {

    it('Should pass tests instance name', () => {
        const assertionCodeGenerator: AssertionCodeGenerator = new AssertionCodeGenerator('tests', 'asserter', 'assertion');
        const code: string = assertionCodeGenerator.generate();

        expect(code).toBe('try {\n' +
            '            const evaluated = {name: assertion.name};\n' +
            '            (Object.keys(assertion) || [])\n' +
            "                .filter(key => key !== 'name')\n" +
            '                .forEach(key =>       evaluated[key] = eval(assertion[key])   );\n' +
            '            tests.push(asserter.assert(evaluated, assertion));\n' +
            '        } catch (err) {\n' +
            '            tests.push({\n' +
            "                description: `Error executing assertion: '${err}'`,\n" +
            '                valid: false,\n' +
            "                label: 'Assertion code valid'\n" +
            '            });\n' +
            '        }');
    });

});
