import {MultiResultCreator} from "./multi-result-creator";
import {ConsoleResultCreator} from "./console-result-creator";
import {FileResultCreator} from "./file-result-creator";

const addTestSuite = jest.fn();
const addError = jest.fn();
const isValid = jest.fn(() => true);
const create = jest.fn();

let constructorSummaryResultCreator = jest.fn(() => {
    console.log('hey');
    return {
        addTestSuite: addTestSuite,
        addError: addError,
        isValid: isValid,
        create: create
    }
});

jest.mock("./console-result-creator");
ConsoleResultCreator.mockImplementation(constructorSummaryResultCreator);


let constructorFileResultCreator = jest.fn(() => {
    console.log('hey');
    return {
        addTestSuite: addTestSuite,
        addError: addError,
        isValid: isValid,
        create: create
    }
});

jest.mock("./file-result-creator");
FileResultCreator.mockImplementation(constructorFileResultCreator);

describe('MultiResultCreator', () => {

    it('Should create SummaryResult by default', () => {
        new MultiResultCreator();

        expect(constructorSummaryResultCreator).toHaveBeenCalledWith();
    });

    it('Should create FileResultCreator if a name is given', () => {
        const fileName = 'name';
        new MultiResultCreator(fileName);

        expect(constructorFileResultCreator).toHaveBeenCalledWith(fileName);
    });

    it('Should call addTestSuite to every child', () => {
        new MultiResultCreator('name').addTestSuite('name', 'report');

        expect(addTestSuite).toHaveBeenCalledTimes(2);
        expect(addTestSuite).toHaveBeenCalledWith('name', 'report');
    });

    it('Should call addError to every child', () => {
        new MultiResultCreator('name').addError('name');

        expect(addError).toHaveBeenCalledTimes(2);
        expect(addError).toHaveBeenCalledWith('name');
    });

    it('Should call isValid to every child', () => {
        const valid = new MultiResultCreator('name').isValid();

        expect(valid).toBeTruthy();
        expect(isValid).toHaveBeenCalledTimes(2);
        expect(isValid).toHaveBeenCalledWith();
    });

    it('Should call create to every child', () => {
        new MultiResultCreator('name').create();

        expect(create).toHaveBeenCalledTimes(2);
        expect(create).toHaveBeenCalledWith();
    });

});

