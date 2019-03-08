import {RequisitionRunner} from './requisition-runner';
import {RequisitionModel} from '../models/inputs/requisition-model';
import {Timeout} from '../timers/timeout';
import {Store} from '../configurations/store';

jest.mock('../timers/timeout');
Timeout.mockImplementation((cb) => {
    return cb();
});

describe('RequisitionRunner', () => {

    it('Should return requisition reporter skipped', async () => {
        const requisition: RequisitionModel = {
            iterations: 0
        };

        const actual = await new RequisitionRunner(requisition).run();
        expect(actual!.valid).toBeTruthy();
        expect(actual!.tests[0].valid).toBeTruthy();
    });

    it('Should return requisition report collection', async () => {
        const requisition: RequisitionModel = {
            name: 'super cool',
            iterations: 2,
            requisitions: [
                {
                    name: 'first child'
                },
                {
                    name: 'second child'
                }
            ]
        };

        const report = await new RequisitionRunner(requisition).run();
        expect(report.time).toBeDefined();

        expect(report.name).toBe(requisition.name);
        expect(report.valid).toBeTruthy();
        expect(report.requisitions![0].name).toBeDefined();
        expect(report.requisitions![0].requisitions![0].name).toBe(requisition.requisitions![0].name);
        expect(report.requisitions![0].requisitions![0].valid).toBeTruthy();
        expect(report.requisitions![0].requisitions![1].name).toBe(requisition.requisitions![1].name);
        expect(report.requisitions![0].requisitions![1].valid).toBeTruthy();

        expect(report.requisitions![1].name).toBeDefined();
        expect(report.requisitions![1].requisitions![0].name).toBe(requisition.requisitions![0].name);
        expect(report.requisitions![1].requisitions![0].valid).toBeTruthy();
        expect(report.requisitions![1].requisitions![1].name).toBe(requisition.requisitions![1].name);
        expect(report.requisitions![1].requisitions![1].valid).toBeTruthy();
    });

    it('Should replace stuff', async () => {
        const keyName = 'value';
        Store.getData().keyName = keyName;
        // @ts-ignore
        const requisition: RequisitionModel = {
            name: '<<keyName>>',
        };

        const report = await new RequisitionRunner(requisition).run();
        expect(report.name).toBe(keyName);
    });

});
