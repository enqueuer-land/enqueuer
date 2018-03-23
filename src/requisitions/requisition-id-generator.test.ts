import {RequisitionIdGenerator} from "./requisition-id-generator";
import {DateController} from "../timers/date-controller";

jest.mock("../timers/date-controller");
DateController.mockImplementation(() => {
    return {
        getStringOnlyNumbers: () => {
            return "20180315202020"
        }
    };
});

describe('RequisitionIdGenerator', () => {

    const calculateHash = (requisition): number => {
        return Math.abs((requisition + '').split("")
            .reduce((a, b) => {
                a = ((a << 5) - a) + b.charCodeAt(0);
                return a & a
            }, 0));
    }

    it('generateId', () => {
        const text: string = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";
        const idGenerator: RequisitionIdGenerator = new RequisitionIdGenerator(text);
        const expected =  "enqueuer_" + calculateHash(text) + "_" + new DateController().getStringOnlyNumbers();

        let generatedId = idGenerator.generateId();

        expect(generatedId.substr(0, generatedId.length - 2)).toBe(expected);
    });

});