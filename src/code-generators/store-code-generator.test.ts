import {StoreCodeGenerator} from './store-code-generator';
import {Event} from '../models/events/event';

const event: Event = {
    store: {
        first: 'firstValue',
        second: 'secondValue'
    }
};

describe('StoreCodeGenerator', () => {
    it('Should create code', () => {
        const storeCodeGenerator: StoreCodeGenerator = new StoreCodeGenerator('tests', 'storeName');
        const code: string = storeCodeGenerator.generate(event.store);

        expect(code).toBe(
            'try {\n' +
                "                        storeName['first'] = firstValue;\n" +
                '                    } catch (err) {\n' +
                "                        const msg = `Error executing store 'first' code: '${err}'`;\n" +
                '                        Logger.error(msg);\n' +
                '                        tests.push({\n' +
                '                                description: msg,\n' +
                '                                valid: false,\n' +
                '                                name: "Valid \'store\' in event code"\n' +
                '                            });\n' +
                '                    }\n' +
                'try {\n' +
                "                        storeName['second'] = secondValue;\n" +
                '                    } catch (err) {\n' +
                "                        const msg = `Error executing store 'second' code: '${err}'`;\n" +
                '                        Logger.error(msg);\n' +
                '                        tests.push({\n' +
                '                                description: msg,\n' +
                '                                valid: false,\n' +
                '                                name: "Valid \'store\' in event code"\n' +
                '                            });\n' +
                '                    }\n'
        );
    });
});
