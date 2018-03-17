import {RequisitionStarter} from "./requisition-starter";
import {MultiPublisher} from "../publishers/multi-publisher";
import {RequisitionRunner} from "./requisition-runner";
import {RequisitionModel} from "./models/requisition-model";


const publishMock = jest.fn();
jest.mock("../publishers/multi-publisher");
MultiPublisher.mockImplementation(() => {
    return {
        publish: publishMock
    };
});

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
            startEvent: {},
            reports: [{type: "ahoy"}]
        };
    };

    it("Should initialize properly", () => {
        const model: RequisitionModel = createRequisitionModel();


        new RequisitionStarter(model);


        expect(MultiPublisher).toHaveBeenCalledTimes(1);
        expect(MultiPublisher).toHaveBeenCalledWith(model.reports);
        expect(RequisitionRunner).toHaveBeenCalledTimes(1);
        expect(RequisitionRunner).toHaveBeenCalledWith(model);
    })

    it("Should start requisitionRunner", () => {
        const model: RequisitionModel = createRequisitionModel();
        const requisitionStarter: RequisitionStarter = new RequisitionStarter(model);


        requisitionStarter.start();


        expect(startMock).toHaveBeenCalledTimes(1);
        expect(publishMock).toHaveBeenCalledWith("report");
    })
})