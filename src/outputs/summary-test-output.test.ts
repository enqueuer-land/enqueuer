import {SummaryTestOutput} from './summary-test-output';

let consoleLogMock = jest.fn((message) => console.warn(message));
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
                name: 'testName',
                valid: true,
                description: ''
            }]
        }).print();

        expect(consolePrintedTimes('name')).toBe(1);
        expect(consolePrintedTimes('testName')).toBe(0);
    });

    it('should print failed tests name', () => {
        new SummaryTestOutput({
            name: 'name',
            valid: true,
            tests: [{
                name: 'failing',
                valid: false,
                description: ''
            }, {
                name: 'passingTest',
                valid: true,
                description: ''
            }]
        }, {printFailingTests: true, level: 0}).print();

        expect(consolePrintedTimes('failing')).toBe(1);
        expect(consolePrintedTimes('passingTest')).toBe(0);
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

        expect(consolePrintedTimes('PASS')).toBe(1);
        expect(consolePrintedTimes('FAIL')).toBe(0);
        expect(consolePrintedTimes('NULL')).toBe(0);
        expect(consolePrintedTimes('SKIP')).toBe(0);
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

        expect(consolePrintedTimes('NULL')).toBe(0);
        expect(consolePrintedTimes('FAIL')).toBe(1);
        expect(consolePrintedTimes('PASS')).toBe(0);
        expect(consolePrintedTimes('SKIP')).toBe(0);
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
                description: 'secDesc'
            }]
        }, {printTests: true, level: 0}).print();

        expect(consolePrintedTimes('FAIL')).toBe(1);
        expect(consolePrintedTimes('name')).toBe(3);

        expect(consolePrintedTimes('any')).toBe(1);
        expect(consolePrintedTimes('description')).toBe(1);

        expect(consolePrintedTimes('second')).toBe(1);
        expect(consolePrintedTimes('secDesc')).toBe(1);
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

        expect(consolePrintedTimes('SKIP')).toBe(1);
        expect(consolePrintedTimes('NULL')).toBe(0);
        expect(consolePrintedTimes('PASS')).toBe(0);
        expect(consolePrintedTimes('FAIL')).toBe(0);
    });

    it('should print SKIP when every test is ignored', () => {
        new SummaryTestOutput({
            name: 'name',
            valid: true,
            tests: [{
                name: 'any',
                ignored: true,
                valid: true,
                description: ''
            }]
        }).print();

        expect(consolePrintedTimes('SKIP')).toBe(1);
        expect(consolePrintedTimes('NULL')).toBe(0);
        expect(consolePrintedTimes('PASS')).toBe(0);
        expect(consolePrintedTimes('FAIL')).toBe(0);
    });

    it('should print SKIP when child is ignored', () => {
        new SummaryTestOutput({
            name: 'name',
            valid: true,
            tests: [{
                name: 'any',
                ignored: true,
                valid: false,
                description: ''
            }]
        }).print();

        expect(consolePrintedTimes('SKIP')).toBe(1);
        expect(consolePrintedTimes('NULL')).toBe(0);
        expect(consolePrintedTimes('PASS')).toBe(0);
        expect(consolePrintedTimes('FAIL')).toBe(0);
    });

    it('should print NULL when there is no test', () => {
        new SummaryTestOutput({
            name: 'name',
            valid: true,
            tests: []
        }).print();

        expect(consolePrintedTimes('NULL')).toBe(1);
        expect(consolePrintedTimes('SKIP')).toBe(0);
        expect(consolePrintedTimes('PASS')).toBe(0);
        expect(consolePrintedTimes('FAIL')).toBe(0);
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

        expect(consolePrintedTimes(totalTime)).toBe(1);
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

        expect(consolePrintedTimes('publisher')).toBe(1);
        expect(consolePrintedTimes('subscription')).toBe(1);
        expect(consolePrintedTimes('requisition')).toBe(0);
    });

    it('should not print children if it is deeper than max', () => {

        new SummaryTestOutput({
            name: 'name',
            valid: true,
            tests: [],
            publishers: [{name: 'publisher', valid: false}],
            subscriptions: [{name: 'subscription', valid: false}],
        }, {maxLevel: 0, level: 0}).print();

        expect(consolePrintedTimes('name')).toBe(1);
        expect(consolePrintedTimes('publisher')).toBe(0);
        expect(consolePrintedTimes('subscription')).toBe(0);
        expect(consolePrintedTimes('requisition')).toBe(0);
    });

    const consolePrintedTimes = (text: any): number => {
        return consoleLogMock.mock.calls.reduce((acc: number, mockCall: any) => acc + mockCall[0].includes(text), 0);
    };
});
