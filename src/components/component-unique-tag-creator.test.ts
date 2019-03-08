import {ComponentUniqueTagCreator} from './component-unique-tag-creator';
import {RequisitionModel} from '../models/inputs/requisition-model';

describe('ComponentUniqueTagCreator', () => {

    it('Should create uniqueId', () => {
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

        const refreshed = new ComponentUniqueTagCreator().refresh(requisition);

        // @ts-ignore
        const foundIds: RequisitionModel = [];
        expect(foundIds).not.toContainEqual(refreshed.uniqueTag);
        foundIds.push(refreshed.uniqueTag);

        expect(foundIds).not.toContainEqual(refreshed.requisitions![0].publishers[0].uniqueTag);
        foundIds.push(refreshed.requisitions![0].publishers[0].uniqueTag);

        expect(foundIds).not.toContainEqual(refreshed.requisitions![1].subscriptions[0].uniqueTag);
        foundIds.push(refreshed.requisitions![1].subscriptions[0].uniqueTag);
        expect(foundIds).not.toContainEqual(refreshed.requisitions![1].subscriptions[1].uniqueTag);
        foundIds.push(refreshed.requisitions![1].subscriptions[1].uniqueTag);

        expect(foundIds).not.toContain(undefined);

    });

    it('Should refresh uniqueId', () => {
        const requisition: RequisitionModel = {
            name: 'super cool',
            uniqueId: 'some',
            requisitions: [
                {
                    uniqueId: 'other',
                    name: 'first child',
                    publishers: [{uniqueId: 'asd'}]
                },
                {
                    subscriptions: [{uniqueId: 'oi'}, {}]
                }
            ]
        };

        const refreshed = new ComponentUniqueTagCreator().refresh(requisition);

        // @ts-ignore
        expect(refreshed.uniqueTag).not.toBe('some');
        expect(refreshed.requisitions![0].uniqueTag).not.toBe('other');
        // @ts-ignore
        expect(refreshed.requisitions![0].publishers[0].uniqueTag).not.toBe('asd');
        // @ts-ignore
        expect(refreshed.requisitions![1].subscriptions[0].uniqueTag).not.toBe('oi');

    });

});
