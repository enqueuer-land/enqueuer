import {RequisitionIdGenerator} from "./requisition-id-generator";
import {DateController} from "../timers/date-controller";
var hash = require('object-hash');

jest.mock("../timers/date-controller");
DateController.mockImplementation(() => {
    return {
        getStringOnlyNumbers: () => {
            return "20180409113740057612"
        }
    };
});

describe('RequisitionIdGenerator', () => {

    it('generateId', () => {
        const text: string = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";
        const idGenerator: RequisitionIdGenerator = new RequisitionIdGenerator(text);
        const expected =  new DateController().getStringOnlyNumbers() + "_" +
            hash(text).substr(0, 8);

        let generatedId = idGenerator.generateId();

        expect(generatedId).toBe(expected);
    });

});