import {IdGenerator} from "./id-generator";
import {createHash } from "crypto"
import {Json} from "../object-notations/json";
import {DateController} from "../timers/date-controller";

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
        const hash = createHash('sha256');
        hash.update(text, 'utf8');
        const coded: string = hash.digest('hex');

        const idGenerator: IdGenerator = new IdGenerator(text);
        const expected =  new DateController().getStringOnlyNumbers() + "_" +
            coded.substr(0, 8);

        let generatedId = idGenerator.generateId();

        expect(generatedId).toBe(expected);
    });

    it('generateId of objects', () => {
        const value = {
            deep: {
                deeper: {
                    deepest: true
                }
            }
        };
        const hash = createHash('sha256');
        hash.update(new Json().stringify(value), 'utf8');
        const coded: string = hash.digest('hex');

        const idGenerator: IdGenerator = new IdGenerator(value);
        const expected =  new DateController().getStringOnlyNumbers() + "_" +
            coded.substr(0, 8);

        let generatedId = idGenerator.generateId();

        expect(generatedId).toBe(expected);
    });

});