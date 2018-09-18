import {IdGenerator} from "./id-generator";
import {DateController} from "./date-controller";
import {StringRandomCreator} from "./string-random-creator";
var hash = require('object-hash');

jest.mock("../timers/date-controller");
DateController.mockImplementation(() => {
    return {
        getStringOnlyNumbers: () => {
            return "20180409113740057612"
        }
    };
});

describe('StringRandomCreator', () => {

    it('length', () => {
        const length = 10;
        const creator: StringRandomCreator = new StringRandomCreator();

        let created = creator.create(length);

        expect(created.length).toBe(length);
    });

    it('possibles', () => {
        const length = 10;
        const creator: StringRandomCreator = new StringRandomCreator("A");

        let created = creator.create(length);

        expect(created.length).toBe(length);
        expect(created).toBe("AAAAAAAAAA");
    });

    it('empty possibles', () => {
        const length = 10;
        const possibles = "";
        const creator: StringRandomCreator = new StringRandomCreator(possibles);

        let created = creator.create(length);

        expect(created.length).toBe(possibles.length);
        expect(created).toBe(possibles);
    });

});