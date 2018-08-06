import {Tester} from "./tester";

describe('Tester', () => {

    it('Report is empty when initialized', function () {
        const tester: Tester = new Tester;

        expect(tester.getReport().length).toBe(0);
    });

    it('isNotEqualTo', function () {
        const tester: Tester = new Tester;

        tester.isEqualTo('label', 3, 5);
        const equalTo = tester.getReport()[0];

        expect(tester.getReport().length).toBe(1);
        expect(equalTo.label).toBe('label');
        expect(equalTo.valid).toBeFalsy();
        expect(equalTo.description).toEqual('3 is different of 5');
    });

    it('isEqualTo', function () {
        const tester: Tester = new Tester;

        tester.isEqualTo('label', 3, 3);
        const equalTo = tester.getReport()[0];

        expect(tester.getReport().length).toBe(1);
        expect(equalTo.label).toBe('label');
        expect(equalTo.valid).toBeTruthy();
        expect(equalTo.description).toEqual('Expected 3 to be equal to 3');
    });


});

