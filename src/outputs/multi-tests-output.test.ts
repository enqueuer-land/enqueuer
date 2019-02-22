import {MultiTestsOutput} from "./multi-tests-output";
import {SummaryTestOutput} from "./summary-test-output";
import {ProtocolManager} from "../plugins/protocol-manager";
import {ReportFormatterManager} from "../plugins/report-formatter-manager";
import {PluginManager} from "../plugins/plugin-manager";

jest.mock('../plugins/plugin-manager');
PluginManager.getReportFormatterManager.mockImplementation(() => {
    return new ReportFormatterManager()
});
PluginManager.getProtocolManager.mockImplementation(() => {
    return new ProtocolManager()
});

jest.mock("../plugins/report-formatter-manager");
jest.mock("../plugins/protocol-manager");
jest.mock("./summary-test-output");

const print = jest.fn();
let constructorSummary = jest.fn(() => {
    return {
        print: print
    }
});
SummaryTestOutput.mockImplementation(constructorSummary);

const publishMock = jest.fn();
let format = jest.fn();
const create = jest.fn(() => {
    return {
        format: format
    }
});

const createPublisherMock = jest.fn(() => {
    return {
        publish: publishMock,
    }
});
ProtocolManager.mockImplementation(() => {
    return {
        createPublisher: createPublisherMock
    }
});
const formatMock = jest.fn();
const createReportFormatterMock = jest.fn(() => {
    return {
        format: formatMock,
    }
});
ReportFormatterManager.mockImplementation(() => {
    return {
        createReportFormatter: createReportFormatterMock
    }
});

describe('MultiTestsOutput', () => {
    beforeEach(() => {
        print.mockClear();
        constructorSummary.mockClear();
        SummaryTestOutput.mockClear();
        publishMock.mockClear();
        format.mockClear();
        create.mockClear();
        createPublisherMock.mockClear();
    });

    it('Should create an output and a createFunction', () => {
        const output = {type: 'output', format: 'createFunction'};
        new MultiTestsOutput([output]);

        expect(createPublisherMock).toHaveBeenCalledWith(output);
    });

    it('Should print a summary in execute', async () => {
        const report = {};
        const output = {type: 'output', format: 'createFunction'};
        await new MultiTestsOutput([output]).execute(report);

        expect(SummaryTestOutput).toHaveBeenCalledWith(report);
        expect(print).toHaveBeenCalledWith();
    });

    it('Should format before printing', async () => {

        const report = {};
        const output = {type: 'output', format: 'createFunction'};
        await new MultiTestsOutput([output]).execute(report);

        expect(publishMock).toHaveBeenCalledWith();
    });

});

