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

    it('Should return requisition reporter skipped', done => {
        const requisition: RequisitionModel = {
            timeout: '<<keyName>>',
            iterations: 0
        };

        new RequisitionRunner(requisition).run().then(report => {
            expect(report.valid).toBeTruthy();
            expect(report.tests[0].valid).toBeTruthy();
            done();
        });
        expect(startMock).not.toHaveBeenCalled();
    });

    it('Should return requisition report', () => {
        const requisition: RequisitionModel = {
            timeout: '<<keyName>>',
        };

        expect(new RequisitionRunner(requisition).run()).resolves.toBe(report);
        expect(requisitionReporterConstructorMock).toHaveBeenCalledWith({"timeout": "value"});
        expect(startMock).toHaveBeenCalled();
    });

    it('Should return requisition report collection', done => {
        const requisition: RequisitionModel = {
            timeout: '<<keyName>>',
            name: 'req name',
            iterations: 2
        };

        new RequisitionRunner(requisition).run().then((report) => {
            expect(report.time).toBeDefined();
            delete report.time;
            expect(report).toEqual({
                "name": "req name iterator collection",
                "requisitions": ["I'm a report", "I'm a report"],
                "publishers": [],
                "subscriptions": [],
                "tests": [],
                "valid": true
            });
            done();
        });
    });

});