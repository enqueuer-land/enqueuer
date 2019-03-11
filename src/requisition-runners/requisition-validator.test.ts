import {RequisitionValidator} from './requisition-validator';

describe('RequisitionValidator', () => {
    it('Should return error message', () => {
        expect(new RequisitionValidator().getErrorMessage())
            .toBe('Unable to find: \'onInit\', \'onFinish\', \'delay\', \'requisitions\', \'publishers\' nor \'subscriptions\'');
    });

    it('Should accept onInit', () => {
        expect(new RequisitionValidator().validate({onInit: {}})).toBeTruthy();
    });

    it('Should accept delay', () => {
        expect(new RequisitionValidator().validate({delay: {}})).toBeTruthy();
    });

    it('Should accept onFinish', () => {
        expect(new RequisitionValidator().validate({onFinish: {}})).toBeTruthy();
    });

    it('Should accept publishers', () => {
        expect(new RequisitionValidator().validate({publishers: [{type: ''}]})).toBeTruthy();
    });

    it('Should reject empty publishers', () => {
        expect(new RequisitionValidator().validate({publishers: []})).toBeFalsy();
    });

    it('Should reject publishers with no type', () => {
        expect(new RequisitionValidator().validate({publishers: [{}]})).toBeFalsy();
    });

    it('Should accept subscriptions', () => {
        expect(new RequisitionValidator().validate({subscriptions: [{type: ''}]})).toBeTruthy();
    });

    it('Should reject empty subscriptions', () => {
        expect(new RequisitionValidator().validate({subscriptions: []})).toBeFalsy();
    });

    it('Should reject subscriptions with no type', () => {
        expect(new RequisitionValidator().validate({subscriptions: [{}]})).toBeFalsy();
    });

    it('Should go recursive', () => {
        expect(new RequisitionValidator().validate({
            requisitions: [{
                requisitions: [{
                    onInit: {}
                }]
            }]
        })).toBeTruthy();
    });
});
