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


        expect(multiplied.map(req => req.name)).toEqual(["file [0]", "file [1]", "file [2]", "file [3]", "file [4]", "file [5]", "file [6]", "file [7]", "file [8]", "file [9]"]);
        expect(multiplied.length).toBe(requisition.iterations);
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
        requisition.iterations = 1;
        const multiplied = new RequisitionMultiplier(requisition).multiply();

        expect(multiplied.length).toBe(requisition.iterations);
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
