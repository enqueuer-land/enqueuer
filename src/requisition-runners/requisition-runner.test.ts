import {RequisitionRunner} from './requisition-runner';
import {RequisitionModel} from '../models/inputs/requisition-model';
import {Store} from '../configurations/store';

describe('RequisitionRunner', () => {

    it('Should return requisition reporter skipped', async () => {
        // @ts-ignore
        const requisition: RequisitionModel = {
            iterations: 0,
            name: 'skipped',
            id: 'id'
        };

        const reports = await new RequisitionRunner(requisition).run();
        const actual = reports[0];

        expect(reports.length).toBe(1);
        expect(actual.name).toBe(requisition.name);
        expect(actual.id).toBe(requisition.id);
        expect(actual.valid).toBeTruthy();
        expect(actual.tests[0].valid).toBeTruthy();
    });

    // it('Should return requisition report collection', async () => {
    //     const requisition: RequisitionModel = {
    //         name: 'super cool',
    //         iterations: 1,
    //         requisitions: [
    //             {
    //                 name: 'first child',
    //                 publishers: [],
    //                 subscriptions: [],
    //             },
    //         ]
    //     };
    //
    //     const reports = await new RequisitionRunner(requisition).run();
    //     const report = reports[0];
    //
    //     expect(reports.length).toBe(1);
    //     expect(report.time).toBeDefined();
    //
    //     expect(report.name).toBe(requisition.name);
    //     expect(report.valid).toBeTruthy();
    //     expect(report.requisitions![0].name).toBeDefined();
    //     expect(report.requisitions![0].requisitions![0].name).toBe(requisition.requisitions![0].name);
    //     expect(report.requisitions![0].requisitions![0].valid).toBeTruthy();
    //     expect(report.requisitions![0].requisitions![1].name).toBe(requisition.requisitions![1].name);
    //     expect(report.requisitions![0].requisitions![1].valid).toBeTruthy();
    //
    //     expect(report.requisitions![1].name).toBeDefined();
    //     expect(report.requisitions![1].requisitions![0].name).toBe(requisition.requisitions![0].name);
    //     expect(report.requisitions![1].requisitions![0].valid).toBeTruthy();
    //     expect(report.requisitions![1].requisitions![1].name).toBe(requisition.requisitions![1].name);
    //     expect(report.requisitions![1].requisitions![1].valid).toBeTruthy();
    // });

    it('Should replace stuff', async () => {
        const keyName = 'value';
        Store.getData().keyName = keyName;
        // @ts-ignore
        const requisition: RequisitionModel = {
            name: '<<keyName>>',
        };

        const reports = await new RequisitionRunner(requisition).run();
        const report = reports[0];

        expect(reports.length).toBe(1);
        expect(report.name).toBe(keyName);
    });

});
