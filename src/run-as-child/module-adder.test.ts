import { Configuration } from '../configurations/configuration';
import { ModuleAdder } from './module-adder';

jest.mock('../configurations/configuration');

const addPluginMock = jest.fn();
// @ts-ignore
Configuration.getInstance.mockImplementation(() => {
    return {
        addPlugin: addPluginMock
    };
});
describe('ModuleAdder', () => {
    it('should add module when a message arrives', async () => {
        const message = { value: 'value' };
        await new ModuleAdder().process(message);

        expect(addPluginMock).toHaveBeenCalledWith('value');
    });
});
