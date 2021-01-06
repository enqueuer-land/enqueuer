import {RequisitionValidator} from './requisition-validator';

describe('RequisitionValidator', () => {
    it('Should return error message', () => {
        expect(new RequisitionValidator().getErrorMessage())
            .toBe(`Unable to find: 'onInit', 'onFinish', 'delay', 'requisitions', 'publishers', 'subscriptions' nor 'import'.`);
    });

    it('Should reject empty', () => {
        // @ts-expect-error
        expect(new RequisitionValidator().validate()).toBeFalsy();
    });

    it('Should accept import', () => {
        // @ts-expect-error
        expect(new RequisitionValidator().validate({import: {}})).toBeTruthy();
    });

    it('Should accept onInit', () => {
        // @ts-expect-error
        expect(new RequisitionValidator().validate({onInit: {}})).toBeTruthy();
    });

    it('Should accept delay', () => {
        // @ts-expect-error
        expect(new RequisitionValidator().validate({delay: {}})).toBeTruthy();
    });

    it('Should accept onFinish', () => {
        // @ts-expect-error
        expect(new RequisitionValidator().validate({onFinish: {}})).toBeTruthy();
    });

    it('Should accept publishers', () => {
        // @ts-expect-error
        expect(new RequisitionValidator().validate({publishers: [{type: ''}]})).toBeTruthy();
    });

    it('Should reject empty publishers', () => {
        // @ts-expect-error
        expect(new RequisitionValidator().validate({publishers: []})).toBeFalsy();
    });

    it('Should accept subscriptions', () => {
        // @ts-expect-error
        expect(new RequisitionValidator().validate({subscriptions: [{type: ''}]})).toBeTruthy();
    });

    it('Should reject empty subscriptions', () => {
        // @ts-expect-error
        expect(new RequisitionValidator().validate({subscriptions: []})).toBeFalsy();
    });

    it('Should go recursive', () => {
        expect(new RequisitionValidator().validate({
            requisitions: [{
                // @ts-expect-error
                requisitions: [{
                    onInit: {}
                }]
            }]
        })).toBeTruthy();
    });
});
