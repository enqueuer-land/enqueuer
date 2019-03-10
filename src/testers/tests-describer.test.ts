import {TestsDescriber} from './tests-describer';

import prettyjson from 'prettyjson';

jest.mock('prettyjson');

const render = jest.fn();
// @ts-ignore
prettyjson.render.mockImplementation(render);

describe('TestsDescriber', () => {

    it('should describe every test', () => {
        const status = new TestsDescriber().describeTests();

        expect(render).toHaveBeenCalledWith({
                'assertions': [{
                    'expectToBeTruthy': ' stuffToAssert',
                    'name': ' testLabel #optional'
                }, {'expectToBeFalsy': ' stuffToAssert', 'name': ' testLabel #optional'}, {
                    'expectToBeDefined': ' stuffToAssert',
                    'name': ' testLabel #optional'
                }, {'expectToBeUndefined': ' stuffToAssert', 'name': ' testLabel #optional'}, {
                    'expect': ' actualValue',
                    'name': ' testLabel #optional',
                    'toBeEqualTo': ' expectedValue'
                }, {'expect': ' actualValue', 'name': ' testLabel #optional', 'toBeGreaterThan': ' expectedValue'}, {
                    'expect': ' actualValue',
                    'name': ' testLabel #optional',
                    'toBeGreaterThanOrEqualTo': ' expectedValue'
                }, {'expect': ' actualValue', 'name': ' testLabel #optional', 'toBeLessThan': ' expectedValue'}, {
                    'expect': ' actualValue',
                    'name': ' testLabel #optional',
                    'toBeLessThanOrEqualTo': ' expectedValue'
                }, {'expect': ' actualValue', 'name': ' testLabel #optional', 'toContain': ' expectedValue'}]
            }, expect.anything());
    });

});
