import {RequisitionParentCreator} from './requisition-parent-creator';

describe('RequisitionParentCreator', () => {

    it('Should set name', () => {
        const name = 'specialName';

        const parent = new RequisitionParentCreator().create(name);

        expect(parent.name).toBe(name);
    });

    it('Should set id', () => {
        const parent = new RequisitionParentCreator().create('specialName');

        expect(parent.id).toBeDefined();
    });

    it('Should set default children', () => {
        const parent = new RequisitionParentCreator().create('specialName');

        expect(parent.requisitions).toEqual([]);
    });

    it('Should set children', () => {
        const childRequisitions = [{name: 1}];
        // @ts-ignore
        const parent = new RequisitionParentCreator().create('specialName', childRequisitions);

        expect(parent.requisitions).toEqual(childRequisitions);
    });

    it('Should set children name', () => {
        const childRequisitions = [{name: 1}, {noName: true}];
        // @ts-ignore
        const parent = new RequisitionParentCreator().create('specialName', childRequisitions);

        expect(parent.requisitions![0].name).toBe(childRequisitions[0].name);
        expect(parent.requisitions![1].name).toBeDefined();
    });
});
