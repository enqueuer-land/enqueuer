import {ComponentParentCreator} from './component-parent-creator';

describe('ComponentParentCreator', () => {

    it('Should set publishers parent', () => {
        const requisition = {
            name: 'parent',
            publishers: [{name: 'publisher'}, {name: 'publisher2'}]
        };

        // @ts-ignore
        new ComponentParentCreator().createRecursively(requisition);

        expect(requisition.publishers.every((publisher: any) => publisher.parent.name)).toBeTruthy();
    });

    it('Should set subscriptions parent', () => {
        const requisition = {
            name: 'parent',
            subscriptions: [{name: 'subscription'}, {name: 'subscription2'}]
        };

        // @ts-ignore
        new ComponentParentCreator().createRecursively(requisition);

        expect(requisition.subscriptions.every((subscription: any) => subscription.parent.name)).toBeTruthy();
    });

    it('Should set requisitions parent', () => {
        const requisition = {
            name: 'parent',
            requisitions: [{name: 'requisition'}, {name: 'requisition2'}]
        };

        // @ts-ignore
        new ComponentParentCreator().createRecursively(requisition);

        expect(requisition.requisitions.every((child: any) => child.parent.name)).toBeTruthy();
    });

    it('Should go recursive', () => {
        const original = {
            name: '1',
            requisitions: [{
                name: '2',
                requisitions: [{
                    name: '3',
                    requisitions: [{
                        name: '4',
                        publishers: [{name: 'publisher'}, {name: 'publisher2'}],
                        subscriptions: [{name: 'subscription'}, {name: 'subscription2'}]
                    }]
                }]
            }]
        };

        // @ts-ignore
        const requisition: any = new ComponentParentCreator().createRecursively(original);

        expect(requisition.requisitions[0].requisitions[0].requisitions[0]
            .publishers.every((publisher: any) => publisher.parent.name === '4')).toBeTruthy();
        expect(requisition.requisitions[0].requisitions[0].requisitions[0]
            .subscriptions.every((subscription: any) => subscription.parent.name === '4')).toBeTruthy();
        expect(requisition.requisitions[0].requisitions[0].requisitions[0].parent.name).toBe('3');
        expect(requisition.requisitions[0].requisitions[0].parent.name).toBe('2');
        expect(requisition.requisitions[0].parent.name).toBe('1');
        expect(requisition.requisitions[0].parent.requisitions[0].name).toBe('2');
        expect(requisition.requisitions[0].parent.requisitions[0].requisitions[0].name).toBe('3');
    });

});
