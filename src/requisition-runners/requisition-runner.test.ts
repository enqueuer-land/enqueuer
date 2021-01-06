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
        expect(actual.hooks!.onInit.valid).toBeTruthy();
        expect(actual.hooks!.onFinish.valid).toBeTruthy();
    });

    it('Should return requisition report collection', async () => {
        const requisition: RequisitionModel = {
            name: 'super cool',
            iterations: 5,
            requisitions: [],
            publishers: [],
            subscriptions: [],
        } as any;

        const reports = await new RequisitionRunner(requisition).run();
        const report = reports[0];

        expect(reports.length).toBe(requisition.iterations);
        expect(report.time).toBeDefined();
        expect(report.name).toContain(requisition.name);
        expect(report.valid).toBeTruthy();
    });

    it('Should run children requisition report collection', async () => {
        const requisition: RequisitionModel = {
            name: 'super cool',
            // @ts-ignore
            requisitions: [{
                name: 'child',
                publishers: [],
                subscriptions: [],
                requisitions: []
            }],
            publishers: [],
            subscriptions: [],
        };

        const reports = await new RequisitionRunner(requisition).run();
        const report = reports[0].requisitions[0];

        expect(report.time).toBeDefined();
        expect(report.name).toContain('child');
        expect(report.valid).toBeTruthy();
    });

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
