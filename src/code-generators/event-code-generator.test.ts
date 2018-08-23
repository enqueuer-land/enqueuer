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

    it('Should insert script', () => {
        const eventCodeGenerator: EventCodeGenerator = new EventCodeGenerator('testerName', event);
        const code: string = eventCodeGenerator.generate();

        expect(code).toBe("try {\n" +
            "                        hey\n" +
            "                    } catch (err) {\n" +
            "                        testerName.addTest({\n" +
            "                                errorDescription: `Error executing 'script' code: '${err}'`,\n" +
            "                                valid: false,\n" +
            "                                label: \"Valid 'script' code\"\n" +
            "                            });\n" +
            "                    }\n" +
            "jude\n" +
            "jude\n");
    });

    it('Should generate assertions code', () => {
        assertGenerateMock = jest.fn(() => 'jude');

        const eventCodeGenerator: EventCodeGenerator = new EventCodeGenerator('tester', event);
        eventCodeGenerator.generate();

        expect(assertGenerateMock).toHaveBeenCalledTimes(event.assertions.length);
        expect(assertGenerateMock).toHaveBeenCalledWith(event.assertions[0]);
        expect(assertGenerateMock).toHaveBeenCalledWith(event.assertions[1]);
    });

});