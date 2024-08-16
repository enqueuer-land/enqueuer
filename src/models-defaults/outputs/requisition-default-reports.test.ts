import {RequisitionDefaultReports} from './requisition-default-reports';

describe('RequisitionDefaultReports', () => {
    it('default', () => {
        const report = RequisitionDefaultReports.createDefaultReport({
            name: 'g',
            id: 'id',
            level: 13,
            iteration: 1,
            totalIterations: 5
        });
        expect(report.time!.startTime).toBeDefined();
        expect(report.time!.endTime).toBeDefined();
        expect(report.time!.totalTime).toBeLessThan(1000);
        delete report.time;
        expect(report).toEqual({
            hooks: {
                onFinish: {arguments: {}, tests: [], valid: true},
                onInit: {arguments: {}, tests: [], valid: true}
            },
            id: 'id',
            iteration: 1,
            totalIterations: 5,
            ignored: undefined,
            level: 13,
            name: 'g',
            publishers: [],
            requisitions: [],
            subscriptions: [],
            valid: true
        });
    });

    it('createIteratorReport', () => {
        // @ts-expect-error
        const report = RequisitionDefaultReports.createIteratorReport({
            name: 'g'
        });
        expect(report.id).toBeUndefined();
        expect(report.time!.startTime).toBeDefined();
        expect(report.time!.endTime).toBeDefined();
        expect(report.time!.totalTime).toBeLessThan(1000);
        delete report.time;
        expect(report).toEqual({
            hooks: {
                onFinish: {arguments: {}, tests: [], valid: true},
                onInit: {arguments: {}, tests: [], valid: true}
            },
            id: undefined,
            ignored: undefined,
            level: undefined,
            name: 'g',
            publishers: [],
            requisitions: [],
            subscriptions: [],
            valid: true
        });
    });

    it('createRunningError', () => {
        // @ts-expect-error
        const report = RequisitionDefaultReports.createRunningError({name: 'lopidio'}, 'err');
        expect(report.time!.startTime).toBeDefined();
        expect(report.time!.endTime).toBeDefined();
        expect(report.time!.totalTime).toBeLessThan(1000);
        delete report.time;
        expect(report).toEqual({
            hooks: {
                onFinish: {
                    arguments: {},
                    tests: [{description: 'err', name: 'Requisition ran', valid: false}],
                    valid: false
                },
                onInit: {arguments: {}, tests: [], valid: true}
            },
            id: undefined,
            ignored: undefined,
            level: undefined,
            name: 'lopidio',
            publishers: [],
            requisitions: [],
            subscriptions: [],
            valid: false
        });
    });

    it('createSkippedReport', () => {
        // @ts-expect-error
        const report = RequisitionDefaultReports.createSkippedReport({
            name: 'virgs'
        });
        expect(report.time!.startTime).toBeDefined();
        expect(report.time!.endTime).toBeDefined();
        expect(report.time!.totalTime).toBe(0);
        delete report.time;
        expect(report).toEqual({
            hooks: {
                onFinish: {
                    arguments: {},
                    tests: [
                        {
                            description: 'There is no iterations set to this requisition',
                            name: 'Requisition skipped',
                            valid: true
                        }
                    ],
                    valid: true
                },
                onInit: {arguments: {}, tests: [], valid: true}
            },
            id: undefined,
            ignored: undefined,
            level: undefined,
            name: 'virgs',
            publishers: [],
            requisitions: [],
            subscriptions: [],
            valid: true
        });
    });

    it('createIgnoredReport', () => {
        // @ts-expect-error
        const report = RequisitionDefaultReports.createIgnoredReport({
            name: 'virgs'
        });
        expect(report.time!.startTime).toBeDefined();
        expect(report.time!.endTime).toBeDefined();
        expect(report.time!.totalTime).toBe(0);
        delete report.time;
        expect(report).toEqual({
            hooks: {
                onFinish: {arguments: {}, tests: [], valid: true},
                onInit: {arguments: {}, tests: [], valid: true}
            },
            id: undefined,
            ignored: true,
            name: 'virgs',
            publishers: [],
            requisitions: [],
            subscriptions: [],
            valid: true
        });
    });
});
