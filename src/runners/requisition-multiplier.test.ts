import {RequisitionModel} from "../models/inputs/requisition-model";
import {RequisitionMultiplier} from "./requisition-multiplier";

let requisition: RequisitionModel;

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

    it('Should default iterations to 1', () => {
        delete requisition.iterations;

        const multiplied = new RequisitionMultiplier(requisition).multiply();

        expect(multiplied.length).toBe(1);
    });

    it('Should default iterations to 0', () => {
        requisition.iterations = null;

        const multiplied = new RequisitionMultiplier(requisition).multiply();

        expect(multiplied.length).toBe(0);
    });

    it('Should default iterations to 0', () => {
        requisition.iterations = -3;

        const multiplied = new RequisitionMultiplier(requisition).multiply();

        expect(multiplied.length).toBe(0);
    });

});