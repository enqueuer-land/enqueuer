import {DateController} from "../timers/date-controller";
import {StringRandomCreator} from "./string-random-creator";

jest.mock("../timers/date-controller");
// @ts-expect-error
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
