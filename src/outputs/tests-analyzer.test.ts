import {TestsAnalyzer} from './tests-analyzer';
import {RequisitionModel} from '../models/outputs/requisition-model';

describe('TestsAnalyzer', () => {

    it('Percentage should be zero when there are no tests', () => {
        const test: RequisitionModel = {
            name: 'name',
            valid: true,
            tests: []
        };

        const testsAnalyzer = new TestsAnalyzer().addTest(test);

        expect(testsAnalyzer.getFailingTests().length).toBe(0);
        expect(testsAnalyzer.getTests().length).toBe(0);
        expect(testsAnalyzer.getPercentage()).toBe(100);
    });

    it('Should trunc percentage to two decimals number', () => {
        const test: RequisitionModel = {
            name: 'name',
            valid: true,
            tests: [{valid: true}],
            requisitions: [{
                name: 'name',
                valid: true,
                tests: [{valid: true}],

                time: {},
                publishers: [{
                    name: 'name',
                    valid: true,
                    tests: [{valid: false}],

                }]
            }]
        };

        const testsAnalyzer = new TestsAnalyzer().addTest(test);

        expect(testsAnalyzer.getFailingTests().length).toBe(1);
        expect(testsAnalyzer.getTests().length).toBe(3);
        expect(testsAnalyzer.getPercentage()).toBe(66.66);
    });

    it('Should count inner tests (inner runnable is undefined)', () => {

        const test: RequisitionModel = {
            name: 'name',
            valid: true,
            tests: [],
        };

        const testsAnalyzer = new TestsAnalyzer().addTest(test);

        expect(testsAnalyzer.getFailingTests().length).toBe(0);
        expect(testsAnalyzer.getTests().length).toBe(0);
        expect(testsAnalyzer.getPercentage()).toBe(100);
    });

    it('Should ignore ignored test to calculate percentage', () => {

        const test: RequisitionModel = {
            name: 'name',
            valid: true,
            tests: [{valid: true}, {ignored: true}, {valid: true, ignored: true}],
        };

        const testsAnalyzer = new TestsAnalyzer().addTest(test);

        expect(testsAnalyzer.getFailingTests().length).toBe(0);
        expect(testsAnalyzer.getTests().length).toBe(3);
        expect(testsAnalyzer.getPercentage()).toBe(100);
    });

    it('Should ignore ignored test to validate', () => {

        const test: RequisitionModel = {
            name: 'name',
            valid: true,
            tests: [{valid: true}, {ignored: true}, {valid: true, ignored: true}],
        };

        const testsAnalyzer = new TestsAnalyzer().addTest(test);

        expect(testsAnalyzer.isValid()).toBeTruthy();
    });

    it('Should get filtered tests', () => {
        const test: RequisitionModel = {
            name: 'name',
            description: 'name',
            tests: [{valid: true}, {valid: true}, {valid: true}, {valid: false}, {valid: true, ignored: true}],
            valid: true,
        };

        const testsAnalyzer = new TestsAnalyzer().addTest(test);

        expect(testsAnalyzer.getFailingTests().length).toBe(1);
        expect(testsAnalyzer.getPassingTests().length).toBe(3);
        expect(testsAnalyzer.getIgnoredList().length).toBe(1);
        expect(testsAnalyzer.getTests().length).toBe(5);
        expect(testsAnalyzer.getNotIgnoredTests().length).toBe(4);
    });

    it('Should ignore even when there is test child', () => {
        const test: RequisitionModel = {
            name: 'name',
            valid: true,
            ignored: true,
            tests: [{
                name: 'any',
                valid: false,
                description: ''
            }]
        };

        const testsAnalyzer = new TestsAnalyzer().addTest(test);

        expect(testsAnalyzer.getFailingTests().length).toBe(0);
        expect(testsAnalyzer.getPassingTests().length).toBe(0);
        expect(testsAnalyzer.getIgnoredList().length).toBe(1);
        expect(testsAnalyzer.getTests().length).toBe(1);
        expect(testsAnalyzer.getNotIgnoredTests().length).toBe(0);
    });

    // it('Should get hierarchy', () => {
    //     const test: RequisitionModel = {
    //         name: 'a',
    //         description: 'name',
    //         tests: [{name: 'a0', valid: true}],
    //         valid: true,
    //         requisitions: [{
    //             name: 'b',
    //             tests: [{name: 'b0', valid: true}],
    //             requisitions: [{
    //                 name: 'c',
    //                 tests: [{name: 'c0', valid: true}],
    //                 requisitions: [{
    //                     name: 'd',
    //                     tests: [{name: 'd0', ignored: true}],
    //                 }, {
    //                     name: 'e',
    //                     ignored: true,
    //                 }],
    //                 publishers: [{
    //                     name: 'p',
    //                     tests: [{name: 'e0', valid: false}]
    //                 }],
    //                 subscriptions: [
    //                     {
    //                         name: 's0',
    //                         tests: [{name: '0', valid: true}]
    //                     },
    //                     {
    //                         name: 's1',
    //                         ignored: true
    //                     }],
    //             }]
    //         }]
    //     };
    //
    //     const tests = new TestsAnalyzer().addTest(test).getTests();
    //
    //     expect(tests.length).toBe(8);
    //     expect(tests[0].parent!.name).toBe('a');
    //     delete tests[0].parent;
    //     expect(tests[0]).toEqual({'name': 'a0', 'valid': true});
    //
    //     expect(tests[1].parent!.name).toBe('b');
    //     delete tests[1].parent;
    //     expect(tests[1]).toEqual({'name': 'b0', 'valid': true});
    //
    //     expect(tests[2].parent!.name).toBe('c');
    //     delete tests[2].parent;
    //     expect(tests[2]).toEqual({'name': 'c0', 'valid': true});
    //
    //     expect(tests[3].parent!.name).toBe('s0');
    //     delete tests[3].parent;
    //     expect(tests[3]).toEqual({'name': '0', 'valid': true});
    //
    //     expect(tests[4].parent!.parent!.name).toBe('b');
    //     expect(tests[4].parent!.name).toBe('c');
    //     delete tests[4].parent;
    //     expect(tests[4]).toEqual({'description': 'Ignored', 'ignored': true, 'name': 's1', 'valid': true});
    //
    //     expect(tests[5].parent!.name).toBe('p');
    //     delete tests[5].parent;
    //     expect(tests[5]).toEqual({'name': 'e0', 'valid': false});
    //
    //     expect(tests[6].parent!.name).toBe('d');
    //     delete tests[6].parent;
    //     expect(tests[6]).toEqual({'name': 'd0', 'ignored': true});
    //
    //     expect(tests[7].parent!.name).toBe('c');
    //     delete tests[7].parent;
    //     expect(tests[7]).toEqual({'name': 'e', 'ignored': true, description: 'Ignored', valid: true});
    //
    // });
});
