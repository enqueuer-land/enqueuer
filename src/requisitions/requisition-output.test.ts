import {RequisitionOutput} from "./requisition-output";
import {Container} from "../injector/container";
import {SuperClassContainer} from "../injector/super-class-container";
import {PublisherModel} from "./models/publisher-model";
import {Publisher} from "../publishers/publisher";

jest.mock("../injector/container");
const getMock = Container.get.mockImplementation(() => {
    return { createFromPredicate: createMock };
});

const createMock = jest.fn((type: any) => {
    return {
        publish: publishMock
    }

});

const publishMock = jest.fn(() => {
    return Promise.reject("error")
});


describe('RequisitionOutput', () => {

    it('Publishes to every output', () => {
        const outputType: PublisherModel = {type: "enqueuer"};
        var message = "someMessage";
        const requisitionOutput = new RequisitionOutput(outputType);

        requisitionOutput.publish(message);

        expect(getMock).toHaveBeenCalledTimes(1);
        expect(getMock).toBeCalledWith(Publisher);

        expect(createMock).toHaveBeenCalledTimes(1);
        expect(createMock).toBeCalledWith(outputType);

        expect(publishMock).toHaveBeenCalledTimes(1);
    });

});