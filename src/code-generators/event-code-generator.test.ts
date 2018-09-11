import {EventCodeGenerator} from './event-code-generator';
import {AssertionCodeGenerator} from './assertion-code-generator';
import {Event} from '../events/event';

const event: Event = {
    script: 'hey',
    assertions: [{name: 'jude'}, {name: 'dont'}]
};

let assertGenerateMock = jest.fn(() => 'jude');
jest.mock('./assertion-code-generator');
AssertionCodeGenerator.mockImplementation(() => {
    return {
        generate: assertGenerateMock,
    };
});


describe('EventCodeGenerator', () => {

    it('Should initialize events attributes', () => {
        const eventCodeGenerator: EventCodeGenerator = new EventCodeGenerator('testerName', 'store', {});
        const code: string = eventCodeGenerator.generate();

        expect(code).toBe("try {\n" +
            "                        \n" +
            "                    } catch (err) {\n" +
            "                        testerName.addTest({\n" +
            "                                errorDescription: `Error executing 'eventName.script' code: '${err}'`,\n" +
            "                                valid: false,\n" +
            "                                label: \"Valid 'script' code\"\n" +
            "                            });\n" +
            "                    }\n");
    });

    it('Should pass testerInstanceName', () => {
        const eventCodeGenerator: EventCodeGenerator = new EventCodeGenerator('testerInstanceName', 'store', {});
        const code: string = eventCodeGenerator.generate();

        expect(code).toBe("try {\n" +
            "                        \n" +
            "                    } catch (err) {\n" +
            "                        testerInstanceName.addTest({\n" +
            "                                errorDescription: `Error executing 'eventName.script' code: '${err}'`,\n" +
            "                                valid: false,\n" +
            "                                label: \"Valid 'script' code\"\n" +
            "                            });\n" +
            "                    }\n");
    });

    it('Should pass storeInstanceName', () => {
        const eventCodeGenerator: EventCodeGenerator = new EventCodeGenerator('testerName', 'storeInstanceName', {store: {value: 'oi'}});
        const code = eventCodeGenerator.generate();

        expect(code).toBe("try {\n" +
            "                        \n" +
            "                    } catch (err) {\n" +
            "                        testerName.addTest({\n" +
            "                                errorDescription: `Error executing 'eventName.script' code: '${err}'`,\n" +
            "                                valid: false,\n" +
            "                                label: \"Valid 'script' code\"\n" +
            "                            });\n" +
            "                    }\n" +
            "try {\n" +
            "                        storeInstanceName['value'] = oi;\n" +
            "                    } catch (err) {\n" +
            "                        testerName.addTest({\n" +
            "                                errorDescription: `Error executing store 'value' code: '${err}'`,\n" +
            "                                valid: false,\n" +
            "                                label: \"Valid store code\"\n" +
            "                            });\n" +
            "                    }\n");
    });

    it('Should insert script', () => {
        const eventCodeGenerator: EventCodeGenerator = new EventCodeGenerator('testerName', 'store', event, 'differentName');
        const code: string = eventCodeGenerator.generate();

        expect(code).toBe("try {\n" +
            "                        hey\n" +
            "                    } catch (err) {\n" +
            "                        testerName.addTest({\n" +
            "                                errorDescription: `Error executing 'differentName.script' code: '${err}'`,\n" +
            "                                valid: false,\n" +
            "                                label: \"Valid 'script' code\"\n" +
            "                            });\n" +
            "                    }\n" +
            "jude\n" +
            "jude\n");
    });

    it('Should generate assertions code', () => {
        assertGenerateMock = jest.fn(() => 'jude');

        const eventCodeGenerator: EventCodeGenerator = new EventCodeGenerator('tester', 'store', event);
        eventCodeGenerator.generate();

        expect(assertGenerateMock).toHaveBeenCalledTimes(event.assertions.length);
        expect(assertGenerateMock).toHaveBeenCalledWith(event.assertions[0]);
        expect(assertGenerateMock).toHaveBeenCalledWith(event.assertions[1]);
    });

});