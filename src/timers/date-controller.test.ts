import {DateController} from "./date-controller";

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

        const expectedToString = currentDate.getFullYear() +
            ("0"+(currentDate.getMonth()+1)).slice(-2) +
            ("0" + currentDate.getDate()).slice(-2)+
            ("0" + currentDate.getHours()).slice(-2) +
            ("0" + currentDate.getMinutes()).slice(-2) +
            ("0" + currentDate.getSeconds()).slice(-2) +
            ("0" + currentDate.getMilliseconds()).slice(-4);


        const actualToString = new DateController(currentDate).getStringOnlyNumbers()

        expect(actualToString).toBe(expectedToString);
    });

    it('should get time', function() {
        const currentDate = new Date();

        const expectedTime = currentDate.getTime()
        const actualTime = new DateController(currentDate).getTime();

        expect(actualTime).toBe(expectedTime);
    });


});