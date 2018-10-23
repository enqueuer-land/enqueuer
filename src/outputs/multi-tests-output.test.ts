import {MultiTestsOutput} from "./multi-tests-output";
import {SummaryTestOutput} from "./summary-test-output";
import {Container} from "conditional-injector";
import {Publisher} from "../publishers/publisher";
import {Formatter} from "./formatters/formatter";
jest.mock("conditional-injector");
jest.mock("./summary-test-output");

const print = jest.fn();
let constructorSummary = jest.fn(() => {
    return {
        print: print
    }
});
SummaryTestOutput.mockImplementation(constructorSummary);


const publish = jest.fn();
let format = jest.fn();
const create = jest.fn(() => {
    return {
        publish: publish,
        format: format
    }
});
let subclassesOfMock = jest.fn(() => {
    return {
        create: create
    }
});
Container.subclassesOf.mockImplementation(subclassesOfMock);


describe('MultiTestsOutput', () => {
    beforeEach(() => {
        print.mockClear();
        constructorSummary.mockClear();
        SummaryTestOutput.mockClear();
        publish.mockClear();
        format.mockClear();
        create.mockClear();
        subclassesOfMock.mockClear();
        Container.subclassesOf.mockClear();
    });

    it('Should create an output and a formatter', () => {
        const output = {type: 'output', format: 'formatter'};
        new MultiTestsOutput([output]);

        expect(subclassesOfMock).toHaveBeenCalledWith(Publisher);
        expect(subclassesOfMock).toHaveBeenCalledWith(Formatter);
        expect(create).toHaveBeenCalledTimes(2);
        expect(create).toHaveBeenCalledWith(output);
    });

    it('Should print a summary in execute', async () => {
        const report = {};
        const output = {type: 'output', format: 'formatter'};
        await new MultiTestsOutput([output]).execute(report);

        expect(SummaryTestOutput).toHaveBeenCalledWith(report);
        expect(print).toHaveBeenCalledWith();
    });

    it('Should format before printing', async () => {
        const formatted = 'formatted';
        format = jest.fn(() => formatted);

        const report = {};
        const output = {type: 'output', format: 'formatter'};
        await new MultiTestsOutput([output]).execute(report);

        expect(format).toHaveBeenCalledWith(report);
        expect(publish).toHaveBeenCalledWith();
    });

});

