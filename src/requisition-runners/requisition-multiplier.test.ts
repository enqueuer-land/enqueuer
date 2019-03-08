import {RequisitionMultiplier} from './requisition-multiplier';
import {RequisitionModel} from '../models/inputs/requisition-model';

describe('RequisitionMultiplier', () => {
    it('Should multiply requisitions by iterations', () => {
        const original = {
            name: 'super',
            iterations: 3,
            deep: {
                deeper: {
                    value: 123
                },
            }
        };

        // @ts-ignore
        const multiplied = new RequisitionMultiplier(original).multiply();

        // @ts-ignore
        expect(multiplied.requisitions.map(child => child.name)).toEqual(['super [0]', 'super [1]', 'super [2]']);
        // @ts-ignore
        multiplied.requisitions.map(child => {
            original.name = child.name;
            expect(child.id).toBeDefined();
            expect(child.deep).toEqual(original.deep);
            expect(child.iterations).toBe(1);
        });
    });

    it('Should set default name', () => {
        const original = {
            name: 'super',
            iterations: 3,
        };

        // @ts-ignore
        const multiplied = new RequisitionMultiplier(original).multiply();

        // @ts-ignore
        multiplied.requisitions.map((child, index) => {
            expect(child.name).toEqual(original.name + ` [${index}]`);
        });
    });

    it('Should default unknown variable', () => {
        const original = {
            iterations: '<<UnknownIterations>>',
        };
        // @ts-ignore
        const multiplied = new RequisitionMultiplier(original).multiply();

        expect(multiplied).toBeUndefined();
    });

    it('Should default (undefined) iterations to 1', () => {
        const original = {};

        // @ts-ignore
        const multiplied = new RequisitionMultiplier(original).multiply();

        expect(multiplied).toBeDefined();
    });

    it('Should default (null) iterations to 0', () => {
        const original = {};
        // @ts-ignore
        original.iterations = null;

        // @ts-ignore
        const multiplied = new RequisitionMultiplier(original).multiply();

        expect(multiplied).toBeUndefined();
    });

    it('Should default negative iterations to 0', () => {
        const original = {
            iterations: -10,
        };

        // @ts-ignore
        const multiplied = new RequisitionMultiplier(original).multiply();

        expect(multiplied).toBeUndefined();
    });

    it('Should keep parent', () => {
        const original = {
            name: 'original',
            iterations: 2,
            parent: {name: 'parent'}
        };
        // @ts-ignore
        original.parent.requisitions = [original];

        // @ts-ignore
        const multiplied = new RequisitionMultiplier(original).multiply();

        expect(multiplied.parent.name).toBe('parent');
        expect(multiplied.requisitions[0].parent.name).toBe(original.name);
        expect(multiplied.requisitions[0].parent.parent.name).toBe('parent');
        expect(multiplied.requisitions[1].parent.name).toBe(original.name);
        expect(multiplied.requisitions[1].parent.parent.name).toBe('parent');
    });

    it('Should refresh ids', () => {
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

        const multiplied = new RequisitionMultiplier(requisition).multiply();

        expect(multiplied!.requisitions![0].uniqueTag).toBeDefined();
        expect(multiplied!.requisitions![0].requisitions![0].uniqueTag).toBeDefined();
        expect(multiplied!.requisitions![0].requisitions![1].uniqueTag).toBeDefined();

        expect(multiplied!.requisitions![1].uniqueTag).toBeDefined();
        expect(multiplied!.requisitions![1].requisitions![0].uniqueTag).toBeDefined();
        expect(multiplied!.requisitions![1].requisitions![1].uniqueTag).toBeDefined();

    });

});
