import {ObjectDecycler} from './object-decycler';

describe('ObjectDecycler', () => {
    it('should stringify cycle reference', () => {
        let value: any = {firstLevel: {secondLevel: {}}};
        value.firstLevel.secondLevel.thirdLevel = value;
        const expected = {firstLevel: {secondLevel: {}}};

        const stringified = new ObjectDecycler().decycle(value);

        expect(stringified).toEqual(expected)
    });

    it('should replace cycle reference', () => {
        let value: any = {firstLevel: {secondLevel: {}}};
        value.firstLevel.secondLevel.thirdLevel = value;
        const replacer = '[CYCLE REFERENCE]';
        const expected = {firstLevel: {secondLevel: {thirdLevel: replacer}}};

        const stringified = new ObjectDecycler(replacer).decycle(value);

        expect(stringified).toEqual(expected)
    });

});