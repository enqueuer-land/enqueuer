import {RequisitionStarter} from "./requisition-starter";
import {RequisitionRunner} from "./requisition-runner";
import {RequisitionModel} from "../models/requisition-model";


const startMock = jest.fn((onFinish: Function) => {
    return onFinish("report");
});
jest.mock("./requisition-runner");
RequisitionRunner.mockImplementation(() => {
    return {
        start: startMock
    };
});

describe("RequisitionStarter",() => {
    let createRequisitionModel = function () {
        return {
            id: "anyStuff",
            requisitionVersion: "any",
            subscriptions: [],
            startEvent: {}
        };
    };

    it("Should initialize properly", () => {
        const model: RequisitionModel = createRequisitionModel();


        new RequisitionStarter(model);


        expect(RequisitionRunner).toHaveBeenCalledTimes(1);
        expect(RequisitionRunner).toHaveBeenCalledWith(model);
    })

    it("Should start requisitionRunner", () => {
        const model: RequisitionModel = createRequisitionModel();
        const requisitionStarter: RequisitionStarter = new RequisitionStarter(model);


        requisitionStarter.start();


        expect(startMock).toHaveBeenCalledTimes(1);
    })
})