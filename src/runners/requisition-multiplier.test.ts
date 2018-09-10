import {RequisitionModel} from "../models/inputs/requisition-model";
import {RequisitionMultiplier} from "./requisition-multiplier";
import {Store} from "../configurations/store";

let requisition: RequisitionModel;

jest.mock('../configurations/store');
Store.getData.mockImplementation(() => {
    return {iterations: 3}
});


describe('RequisitionMultiplier', () => {
    beforeEach(() => {
        requisition = {
            timeout: 3000,
            name: "file",
            iterations: 10,
            subscriptions: [],
            startEvent: {
                publisher: {
                    type: "file",
                    name: "filePublisher",
                    payload: "filePublisher",
                    filenamePrefix: "temp/fileTest",
                    filenameExtension: "file",
                    onInit: "publisher.payload=new Date().getTime();"
                }
            },
            requisitions: []
        };

    });

    it('Should multiply requisitions by iterations', () => {

        const multiplied = new RequisitionMultiplier(requisition).multiply();

        expect(multiplied.length).toBe(requisition.iterations);
    });

    it('Should replace variable', () => {
        requisition.iterations = '<<iterations>>';
        const multiplied = new RequisitionMultiplier(requisition).multiply();

        expect(multiplied.length).toBe(3);
    });

    it('Should default unknown variable', () => {
        requisition.iterations = '<<UnknownIterations>>';
        const multiplied = new RequisitionMultiplier(requisition).multiply();

        expect(multiplied.length).toBe(0);
    });

    it('Should default (undefined) iterations to 1', () => {
        delete requisition.iterations;

        const multiplied = new RequisitionMultiplier(requisition).multiply();

        expect(multiplied.length).toBe(1);
    });

    it('Should set default name', () => {
        delete requisition.iterations;

        const multiplied = new RequisitionMultiplier(requisition).multiply();

        expect(multiplied.length).toBe(1);
        expect(multiplied[0].name).toBe('file');
    });

    it('Should default (null) iterations to 0', () => {
        requisition.iterations = null;

        const multiplied = new RequisitionMultiplier(requisition).multiply();

        expect(multiplied.length).toBe(0);
    });

    it('Should default negative iterations to 0', () => {
        requisition.iterations = -3;

        const multiplied = new RequisitionMultiplier(requisition).multiply();

        expect(multiplied.length).toBe(0);
    });

});