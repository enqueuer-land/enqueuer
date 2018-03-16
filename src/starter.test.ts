import {Starter} from "./starter";
import {Configuration} from "./configurations/configuration";
import {Enqueuer} from "./enqueuer";
import {RequisitionInput} from "./requisitions/requisition-input";
import {MultiPublisher} from "./publishers/multi-publisher";

jest.mock("./configurations/configuration");
Configuration.mockImplementation(() => {
    return {
        getInputs: () => {
            return ["input"];
        },
        getOutputs: () => {
            return ["output", "anotherOutPut"];
        }
    };
});

jest.mock("./enqueuer");
jest.mock("./requisitions/requisition-input");
jest.mock("./publishers/multi-publisher");

let startReturn = jest.fn();
Enqueuer.mockImplementation(() => {
    return {
        execute: startReturn
    };
});

describe('Starter', () => {
    it('should instantiate enqueuer correctly', () => {

        new Starter();

        expect(Configuration).toHaveBeenCalledTimes(1);

        expect(MultiPublisher).toHaveBeenCalledTimes(1)
        expect(MultiPublisher).toHaveBeenCalledWith(["output", "anotherOutPut"]);
        expect(RequisitionInput).toHaveBeenCalledWith("input");

        expect(Enqueuer).toHaveBeenCalledTimes(1);
    });

    it('should starts the enqueuer', () => {
        const starter = new Starter();

        starter.start();

        expect(startReturn).toHaveBeenCalled();
    });

});