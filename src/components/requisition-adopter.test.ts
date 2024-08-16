import {RequisitionAdopter} from './requisition-adopter';

describe('RequisitionAdopter', () => {
    it('Should set default values', () => {
        const parent = new RequisitionAdopter({}).getRequisition();

        expect(parent.name).toBe('Requisition #0');
        expect(parent.id).toBeDefined();
        expect(parent.parent).toBeUndefined();
        expect(parent.requisitions).toEqual([]);
        expect(parent.publishers).toEqual([]);
        expect(parent.subscriptions).toEqual([]);
        expect(parent.delay).toBe(0);
        expect(parent.level).toBe(0);
        expect(parent.iterations).toBe(1);
    });

    it('Should override default values', () => {
        const name = 'specialName';

        const parent = new RequisitionAdopter({
            name: name,
            id: 'otherId',
            value: 123,
            delay: 10000,
            level: 5,
            iterations: 9
        }).getRequisition();

        expect(parent.value).toBe(parent.value);
        expect(parent.name).toBe(parent.name);
        expect(parent.id).toBe(parent.id);
        expect(parent.publishers).toEqual([]);
        expect(parent.subscriptions).toEqual([]);
        expect(parent.requisitions).toEqual([]);
        expect(parent.delay).toBe(parent.delay);
        expect(parent.level).toBe(parent.level);
        expect(parent.iterations).toBe(parent.iterations);
    });

    it('Should initialize publishers', () => {
        const name = 'specialName';

        const publishers = [
            {
                type: 'first',
                name: 'firstName',
                extraValue: 123
            },
            {}
        ];
        const parent = new RequisitionAdopter({
            name,
            publishers: publishers
        }).getRequisition();

        expect(parent.publishers[0].name).toBe(publishers[0].name);
        expect(parent.publishers[0].type).toBe(publishers[0].type);
        expect(parent.publishers[0].extraValue).toBe(publishers[0].extraValue);
        expect(parent.publishers[0].parent.name).toBe(name);
        expect(parent.publishers[0].parent.publishers[0].name).toBe(publishers[0].name);

        expect(parent.publishers[1].name).toBe('Publisher #1');
        expect(parent.publishers[1].type).toBe(publishers[1].type);
        expect(parent.publishers[1].extraValue).toBe(publishers[1].extraValue);
        expect(parent.publishers[1].parent.name).toBe(name);
        expect(parent.publishers[1].parent.publishers[1].name).toBe('Publisher #1');
    });

    it('Should initialize subscriptions', () => {
        const name = 'specialName';

        const subscriptions = [
            {
                type: 'first',
                extraValue: 123
            },
            {
                name: 'secondName'
            }
        ];
        const parent = new RequisitionAdopter({
            name,
            subscriptions: subscriptions
        }).getRequisition();

        expect(parent.subscriptions[0].name).toBe('Subscription #0');
        expect(parent.subscriptions[0].type).toBe(subscriptions[0].type);
        expect(parent.subscriptions[0].extraValue).toBe(subscriptions[0].extraValue);
        expect(parent.subscriptions[0].parent.name).toBe(name);
        expect(parent.subscriptions[0].parent.subscriptions[0].name).toBe('Subscription #0');

        expect(parent.subscriptions[1].name).toBe(subscriptions[1].name);
        expect(parent.subscriptions[1].type).toBe(subscriptions[1].type);
        expect(parent.subscriptions[1].extraValue).toBe(subscriptions[1].extraValue);
        expect(parent.subscriptions[1].parent.name).toBe(name);
        expect(parent.subscriptions[1].parent.subscriptions[1].name).toBe(subscriptions[1].name);
    });

    it('Should initialize requisitions', () => {
        const name = 'specialName';

        const requisitions = [
            {
                extraValue: 123
            },
            {}
        ];
        const parent = new RequisitionAdopter({
            name,
            requisitions
        }).getRequisition();

        expect(parent.name).toBe(name);
        expect(parent.requisitions[0].name).toBe('Requisition #0');
        expect(parent.requisitions[0].extraValue).toBe(requisitions[0].extraValue);

        expect(parent.requisitions[1].name).toBe('Requisition #1');
        expect(parent.requisitions[1].extraValue).toBe(requisitions[1].extraValue);
        expect(parent.requisitions[1].parent!.name).toBe(name);
        expect(parent.requisitions[1].parent!.requisitions[1].name).toBe('Requisition #1');
    });

    it('should merge with default values', () => {
        const requisitions = [
            {
                delay: 200,
                requisitions: [
                    {
                        delay: 100
                    }
                ],
                name: 'examples/no-tests.yml'
            }
        ];

        const requisition = new RequisitionAdopter({
            name: 'name',
            requisitions,
            level: 6
        }).getRequisition();

        expect(requisition.name).toBe('name');
        expect(requisition.id).toBeDefined();
        expect(requisition.parent).toBeUndefined();
        expect(requisition.publishers).toEqual([]);
        expect(requisition.subscriptions).toEqual([]);
        expect(requisition.delay).toBe(0);
        expect(requisition.level).toBe(6);
        expect(requisition.iterations).toBe(1);

        expect(requisition.requisitions[0].name).toBe('examples/no-tests.yml');
        expect(requisition.requisitions[0].id).toBeDefined();
        expect(requisition.requisitions[0].parent!.name).toBe('name');
        expect(requisition.requisitions[0].requisitions[0].delay).toBe(100);
        expect(requisition.requisitions[0].requisitions[0].level).toBe(8);
        expect(requisition.requisitions[0].publishers).toEqual([]);
        expect(requisition.requisitions[0].subscriptions).toEqual([]);
        expect(requisition.requisitions[0].delay).toBe(200);
        expect(requisition.requisitions[0].level).toBe(7);
        expect(requisition.requisitions[0].iterations).toBe(1);
    });

    it('should set parents', () => {
        const parent = {
            name: 'parent',
            requisitions: [{name: 'req'}],
            publishers: [{name: 'pub'}],
            subscriptions: [{name: 'sub'}]
        };

        const requisition = new RequisitionAdopter(parent).getRequisition();

        expect(requisition.requisitions[0].parent!.name).toBe('parent');
        expect(requisition.publishers[0].parent.name).toBe('parent');
        expect(requisition.subscriptions[0].parent.name).toBe('parent');
    });
});
