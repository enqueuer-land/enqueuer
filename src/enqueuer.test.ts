import {Enqueuer} from "./enqueuer";
import {RequisitionInput} from "./requisitions/requisition-input";
import {MultiPublisher} from "./publishers/multi-publisher";

jest.mock("./requisitions/requisition-input")
describe("Enqueuer", () => {

    beforeEach(()=> {
        RequisitionInput.mockReset();
    })

    it("Should connect to each requisition input", () => {
        const connectMock = jest.fn()
                            .mockImplementation(() => Promise.resolve());
        RequisitionInput.mockImplementation(() => {
            return {
                connect: connectMock,
                unsubscribe: () => {}
            }
        });
        const requisitionInputs: RequisitionInput[] = [createRequisitionInput(), createRequisitionInput()];
        const enqueuer: Enqueuer = new Enqueuer(requisitionInputs, new MultiPublisher([]));


        enqueuer.execute();

        expect(connectMock).toHaveBeenCalledTimes(requisitionInputs.length);
    });

    it("Should unsubscribe if connection fails", done => {
        let unsubscribeMock = jest.fn().mockName("unsubscribe")
                                    .mockImplementationOnce(() => {})
                                    .mockImplementationOnce(() => {
                                        expect(unsubscribeMock).toHaveBeenCalledTimes(2)
                                        done()
                                    })
        const connectMock = jest.fn().mockImplementationOnce(() => Promise.reject("first"))
                                    .mockImplementationOnce(() => Promise.resolve())
                                    .mockImplementationOnce(() => Promise.reject("second"));
        RequisitionInput.mockImplementation(() => {
            return {
                connect: connectMock,
                unsubscribe: unsubscribeMock
            }
        });
        const requisitionInputs: RequisitionInput[] = [createRequisitionInput(), createRequisitionInput(), createRequisitionInput()];
        const enqueuer: Enqueuer = new Enqueuer(requisitionInputs, new MultiPublisher([]));

        enqueuer.execute();

    });

    it("Should receive message of connected inputs", done => {
        const receiveMessageMock = jest.fn()
                                    .mockName("receiveMessage")
                                    .mockImplementation(() => {
                                        expect(receiveMessageMock).toHaveBeenCalledTimes(1)
                                        done()
                                                                    });
        const connectMock = jest.fn().mockImplementationOnce(() => Promise.reject())
                                    .mockImplementationOnce(() => Promise.resolve())
                                    .mockImplementationOnce(() => Promise.reject());
        RequisitionInput.mockImplementation(() => {
            return {
                connect: connectMock,
                receiveMessage: receiveMessageMock,
                unsubscribe: () => {}
            }
        });
        const requisitionInputs: RequisitionInput[] = [createRequisitionInput(), createRequisitionInput(), createRequisitionInput()];
        const enqueuer: Enqueuer = new Enqueuer(requisitionInputs, new MultiPublisher([]));

        enqueuer.execute();

    });

    let createRequisitionInput = (): RequisitionInput => {
        return new RequisitionInput({
            type: "anyStuff"
        });
    };

})