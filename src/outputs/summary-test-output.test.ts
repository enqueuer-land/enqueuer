import {SummaryTestOutput} from './summary-test-output';

let consoleLogMock = jest.fn();
console.log = consoleLogMock;

describe('SummaryTestOutput', () => {

    beforeEach(() => {
        consoleLogMock.mockClear();
    });

    it('should print report name', () => {
        new SummaryTestOutput({
            name: 'name',
            valid: true,
            tests: [{
                name: 'notMe',
                valid: true,
                description: ''
            }]
        }).print();

        expect(someConsoleLogIncludes('name')).toBeTruthy();
    });

    it('should print not print tests name', () => {
        new SummaryTestOutput({
            name: 'name',
            valid: true,
            tests: [{
                name: 'notMe',
                valid: true,
                description: ''
            }]
        }).print();

        expect(someConsoleLogIncludes('notMe')).toBeFalsy();
    });

    it('should print PASS', () => {
        new SummaryTestOutput({
            name: 'name',
            valid: true,
            tests: [{
                name: 'any',
                valid: true,
                description: ''
            }]
        }).print();

        expect(someConsoleLogIncludes('PASS')).toBeTruthy();
        expect(someConsoleLogIncludes('FAIL')).toBeFalsy();
        expect(someConsoleLogIncludes('SKIP')).toBeFalsy();
    });

    it('should print FAIL', () => {
        new SummaryTestOutput({
            name: 'name',
            valid: false,
            tests: [{
                name: 'any',
                valid: false,
                description: ''
            }]
        }).print();

        expect(someConsoleLogIncludes('FAIL')).toBeTruthy();
        expect(someConsoleLogIncludes('PASS')).toBeFalsy();
        expect(someConsoleLogIncludes('SKIP')).toBeFalsy();
    });

    it('should print failed tests', () => {
        new SummaryTestOutput({
            name: 'name',
            valid: false,
            tests: [{
                name: 'any',
                valid: false,
                description: 'description'
            }, {
                name: 'second',
                valid: false,
                description: 'secondDesc'
            }]
        }).print();

        expect(someConsoleLogIncludes('FAIL')).toBeTruthy();

        expect(consoleLogMock.mock.calls[1][0].includes('name')).toBeTruthy();
        expect(consoleLogMock.mock.calls[1][0].includes('any')).toBeTruthy();
        expect(consoleLogMock.mock.calls[2][0].includes('description')).toBeTruthy();

        expect(consoleLogMock.mock.calls[3][0].includes('name')).toBeTruthy();
        expect(consoleLogMock.mock.calls[4][0].includes('second')).toBeTruthy();
        expect(consoleLogMock.mock.calls[4][0].includes('secondDesc')).toBeTruthy();
    });

    it('should print SKIP when ignored', () => {
        new SummaryTestOutput({
            name: 'name',
            valid: true,
            ignored: true,
            tests: [{
                name: 'any',
                valid: false,
                description: ''
            }]
        }).print();

        expect(someConsoleLogIncludes('SKIP')).toBeTruthy();
        expect(someConsoleLogIncludes('PASS')).toBeFalsy();
        expect(someConsoleLogIncludes('FAIL')).toBeFalsy();
    });

    it('should print SKIP when there is no test', () => {
        new SummaryTestOutput({
            name: 'name',
            valid: true,
            ignored: true,
            tests: []
        }).print();

        expect(someConsoleLogIncludes('SKIP')).toBeTruthy();
        expect(someConsoleLogIncludes('PASS')).toBeFalsy();
        expect(someConsoleLogIncludes('FAIL')).toBeFalsy();
    });

    it('should print total time', () => {
        const totalTime = 400;
        new SummaryTestOutput({
            name: 'name',
            valid: true,
            time: {
                totalTime: totalTime
            },
            tests: []
        }).print();

        expect(someConsoleLogIncludes(totalTime)).toBeTruthy();
    });

    it('should print children but not recursive', () => {
        new SummaryTestOutput({
            name: 'name',
            valid: true,
            tests: [],
            publishers: [{name: 'publisher'}],
            subscriptions: [{name: 'subscription'}],
            requisitions: [{name: 'requisition'}],
        }).print();

        expect(someConsoleLogIncludes('publisher')).toBeTruthy();
        expect(someConsoleLogIncludes('subscription')).toBeTruthy();
        expect(someConsoleLogIncludes('requisition')).toBeFalsy();
    });

    it('should not print children if it is deeper than max', () => {

        new SummaryTestOutput({
            name: 'name',
            valid: true,
            tests: [],
            publishers: [{name: 'publisher', valid: false}],
            subscriptions: [{name: 'subscription', valid: false}],
        }, 0).print();

        expect(someConsoleLogIncludes('name')).toBeTruthy();
        expect(someConsoleLogIncludes('publisher')).toBeFalsy();
        expect(someConsoleLogIncludes('subscription')).toBeFalsy();
        expect(someConsoleLogIncludes('requisition')).toBeFalsy();
    });

    const someConsoleLogIncludes = (text: any): boolean => {
        return consoleLogMock.mock.calls.some((mockCall: any) => mockCall[0].includes(text));
    };
});
