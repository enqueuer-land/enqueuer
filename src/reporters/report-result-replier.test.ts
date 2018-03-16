import {Container} from "../injector/container";
import {Publisher} from "../publishers/publisher";
import {PublisherModel} from "../requisitions/models/publisher-model";
import {ReportResultReplier} from "./report-result-replier";

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

describe("ReportResultReplier", () => {


    it("Publishes to every output", () => {
        const outputType: PublisherModel[] = [{type: "enqueuerTest"},
                                                {type: "enqueuerAnotherTest"},
                                                {type: "enqueuerAnotherTestJustOneMore"}];
        var message = "someMessage";
        const reportResultReplier = new ReportResultReplier(outputType);


        reportResultReplier.publish(message);


        expect(getMock).toHaveBeenCalledTimes(outputType.length);
        expect(getMock).toBeCalledWith(Publisher);
        expect(createMock).toHaveBeenCalledTimes(outputType.length);
        outputType.forEach(outputType => {
            expect(createMock).toBeCalledWith(outputType);
        })
        expect(publishMock).toHaveBeenCalledTimes(outputType.length);
    })
})