import {Publisher} from "./publisher";
import {PublisherModel} from "../models/inputs/publisher-model";
import {MultiPublisher} from "./multi-publisher";
import {Container} from "conditional-injector";

jest.mock("conditional-injector");
const getMock = Container.subclassesOf.mockImplementation(() => {
    return { create: createMock };
});

const createMock = jest.fn(() => {
    return {
        publish: publishMock
    }

});

const publishMock = jest.fn(() => {
    return Promise.resolve("error")
});

describe("MultiPublisher", () => {


    it("Publishes to every output", done => {
        const outputType: PublisherModel[] = [{type: "enqueuerTest"},
                                                {type: "enqueuerAnotherTest"},
                                                {type: "enqueuerAnotherTestJustOneMore"}];
        const message = "someMessage";
        const multiPublisher = new MultiPublisher(outputType);


        multiPublisher.publish(message).then(() => {
            expect(getMock).toHaveBeenCalledTimes(outputType.length);
            expect(getMock).toBeCalledWith(Publisher);
            expect(createMock).toHaveBeenCalledTimes(outputType.length);
            outputType.forEach(outputType => {
                expect(createMock).toBeCalledWith(outputType);
            });
            expect(publishMock).toHaveBeenCalledTimes(outputType.length);
            done();
        });


    })
});