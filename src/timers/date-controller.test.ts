import {DateController} from "./date-controller";

let leftPad = (number: number, targetLength: number): string => {
    var output = number + '';
    while (output.length < targetLength) {
        output = '0' + output;
    }
    return output;
}


describe('DateController', function() {

    it('should be protected against wrong initialization', function() {
        const date = new DateController(null);

        expect(date).not.toBeNull();
    });

    it('should parse to string properly', function() {
        const currentDate = new Date();

        const expectedToString = currentDate.toISOString();
        const actualToString = new DateController(currentDate).toString();

        expect(actualToString).toBe(expectedToString);
    });

    it('should parse to string with only number properly', function() {
        const currentDate = new Date();

        const expectedToString = leftPad(currentDate.getFullYear(), 4) +
                leftPad(currentDate.getMonth() + 1, 2) +
                leftPad(currentDate.getDate(), 2) +
                leftPad(currentDate.getHours(), 2) +
                leftPad(currentDate.getMinutes(), 2) +
                leftPad(currentDate.getSeconds(), 2) +
                leftPad(currentDate.getMilliseconds(), 4);



        const actualToString = new DateController(currentDate).getStringOnlyNumbers()

        expect(actualToString.substr(0, actualToString.length - 2)).toBe(expectedToString);
    });

    it('should get time', function() {
        const currentDate = new Date();

        const expectedTime = currentDate.getTime()
        const actualTime = new DateController(currentDate).getTime();

        expect(actualTime).toBe(expectedTime);
    });


});