import {RequisitionModel} from "../models/inputs/requisition-model";
import {RequisitionMultiplier} from "./requisition-multiplier";

const requisition: RequisitionModel = {
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


describe('RequisitionMultiplier', () => {
    it('Should multiply requisitions by iterations', () => {

        const multiplied = new RequisitionMultiplier(requisition).multiply();

        expect(multiplied.length).toBe(requisition.iterations);
    });

    it('Should default iterations to 1', () => {
        delete requisition.iterations;

        const multiplied = new RequisitionMultiplier(requisition).multiply();

        expect(multiplied.length).toBe(1);
    });

});