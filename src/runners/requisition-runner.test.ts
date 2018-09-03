import {RequisitionRunner} from "./requisition-runner";
import {RequisitionModel} from "../models/inputs/requisition-model";
import {RequisitionReporter} from "../reporters/requisition-reporter";
import {Store} from '../configurations/store';
import {Timeout} from '../timers/timeout';

const report = "I'm a report";
let startMock = jest.fn((cb) => cb());
let getReportMock = jest.fn(() => report);
let requisitionReporterConstructorMock = jest.fn(() => {
    return {
        start: startMock,
        getReport: getReportMock
    }
});

jest.mock('../reporters/requisition-reporter');
RequisitionReporter.mockImplementation(requisitionReporterConstructorMock);


jest.mock('../configurations/store');
Store.getData.mockImplementation(() => {
    return {keyName: 'value'}
});

jest.mock('../timers/timeout');
Timeout.mockImplementation((cb) => {
    return cb();
});

describe('RequisitionRunner', () => {
    it('Should return requisition reporter reporter', () => {
        const requisition: RequisitionModel = {
            timeout: '<<keyName>>'
        };

        expect(new RequisitionRunner(requisition).run()).resolves.toBe(report);
        expect(requisitionReporterConstructorMock).toHaveBeenCalledWith({timeout: 'value'});
        expect(startMock).toHaveBeenCalled();
    });

});