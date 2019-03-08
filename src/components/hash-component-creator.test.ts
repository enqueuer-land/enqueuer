import {HashComponentCreator} from './hash-component-creator';
import {RequisitionModel} from '../models/inputs/requisition-model';

describe('HashComponentCreator', () => {

    it('Should create hash', () => {
        const requisition: RequisitionModel = {
            name: 'super cool',
            requisitions: [
                {
                    name: 'first child',
                    publishers: [{}]
                },
                {
                    subscriptions: [{}, {}]
                }
            ]
        };

        const refreshed = new HashComponentCreator().refresh(requisition);

        // @ts-ignore
        const foundIds: RequisitionModel = [];
        expect(foundIds).not.toContainEqual(refreshed.hash);
        foundIds.push(refreshed.hash);

        expect(foundIds).not.toContainEqual(refreshed.requisitions![0].publishers[0].hash);
        foundIds.push(refreshed.requisitions![0].publishers[0].hash);

        expect(foundIds).not.toContainEqual(refreshed.requisitions![1].subscriptions[0].hash);
        foundIds.push(refreshed.requisitions![1].subscriptions[0].hash);
        expect(foundIds).not.toContainEqual(refreshed.requisitions![1].subscriptions[1].hash);
        foundIds.push(refreshed.requisitions![1].subscriptions[1].hash);

        expect(foundIds).not.toContain(undefined);

    });

    it('Should refresh hash', () => {
        const requisition: RequisitionModel = {
            name: 'super cool',
            hash: 'some',
            requisitions: [
                {
                    hash: 'other',
                    name: 'first child',
                    publishers: [{hash: 'asd'}]
                },
                {
                    subscriptions: [{hash: 'oi'}, {}]
                }
            ]
        };

        const refreshed = new HashComponentCreator().refresh(requisition);

        // @ts-ignore
        expect(refreshed.hash).not.toBe('some');
        expect(refreshed.requisitions![0].hash).not.toBe('other');
        // @ts-ignore
        expect(refreshed.requisitions![0].publishers[0].hash).not.toBe('asd');
        // @ts-ignore
        expect(refreshed.requisitions![1].subscriptions[0].hash).not.toBe('oi');

    });

});
