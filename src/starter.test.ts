import {Starter} from "./starter";
import {Configuration} from "./configurations/configuration";
import {RequisitionOutput} from "./requisitions/requisition-output";
import {Enqueuer} from "./enqueuer";
import {RequisitionInput} from "./requisitions/requisition-input";

jest.mock("./enqueuer");
jest.mock("./requisitions/requisition-input");
jest.mock("./requisitions/requisition-output");

Configuration.getInstance = () => {
    return {
        getInputs: function (): any {
            return ["input"];
        },
        getOutputs: function (): any {
            return ["output"];
        }
    }
}

let startReturn = jest.fn();
Enqueuer.mockImplementation(() => {
    return {
        execute: startReturn
    };
});

describe('Starter', function() {
    it('should instantiate enqueuer correctly', () => {

        new Starter();

        expect(RequisitionOutput).toHaveBeenCalledWith("output");
        expect(RequisitionInput).toHaveBeenCalledWith("input");

        expect(Enqueuer).toHaveBeenCalled();
    });

    it('should starts the enqueuer', () => {
        const starter = new Starter();

        starter.start();

        expect(startReturn).toHaveBeenCalled();
    });

});