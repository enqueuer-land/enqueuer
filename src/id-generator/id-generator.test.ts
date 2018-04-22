import {IdGenerator} from "./id-generator";
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

describe('IdGenerator', () => {

    it('generateId', () => {
        const text: string = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";
        const idGenerator: IdGenerator = new IdGenerator(text);
        const expected =  new DateController().getStringOnlyNumbers() + "_" +
            hash(text).substr(0, 8);

        let generatedId = idGenerator.generateId();

        expect(generatedId).toBe(expected);
    });

});