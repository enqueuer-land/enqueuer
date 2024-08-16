import {DynamicModulesManager} from '../plugins/dynamic-modules-manager';
import {AssertDescriber} from './assert-describer';

jest.mock('../plugins/dynamic-modules-manager');

const processSendMock = jest.fn();
process.send = processSendMock;

// @ts-ignore
DynamicModulesManager.getInstance.mockImplementation(() => {
    return {
        getAsserterManager: () => ({
            getMatchingAsserters: () => 'mockedAsserter'
        })
    };
});

describe('AssertDescriber', () => {
    it('should describe asserters when a message arrives', async () => {
        const message = {value: 'value'};
        await new AssertDescriber().process(message);

        expect(processSendMock).toHaveBeenCalledWith({
            event: 'ASSERTERS_LIST',
            value: 'mockedAsserter'
        });
    });
});
