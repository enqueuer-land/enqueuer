import {RequisitionOutput} from "./requisition-output";
import {Container} from "../injector/container";
import {PublisherModel} from "./models/publisher-model";
import {Publisher} from "../publishers/publisher";

jest.mock("../injector/container");
const getMock = Container.get.mockImplementation(() => {
    return { createFromPredicate: createMock };
});

const createMock = jest.fn(() => {
    return {
        publish: publishMock
    }

});

const publishMock = jest.fn(() => {
    return Promise.reject("error")
});


describe('RequisitionOutput', () => {

    it('Publishes to output', () => {
        const outputType: PublisherModel = {type: "enqueuerTest"};
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