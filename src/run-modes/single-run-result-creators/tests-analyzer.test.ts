import {TestsAnalyzer} from "./tests-analyzer";
import {RequisitionModel} from "../../models/outputs/requisition-model";
import {TestModel} from "../../models/outputs/test-model";

describe('TestsAnalyzer', () => {

    it('Percentage should be zero when there are no tests', () => {
        const test: RequisitionModel = {
            name: 'name',
            valid: true,
            tests: []
        };

        const testsAnalyzer = new TestsAnalyzer(test);

        expect(testsAnalyzer.getFailingTests().length).toBe(0);
        expect(testsAnalyzer.getTests().length).toBe(0);
        expect(testsAnalyzer.getPercentage()).toBe(100);
    });

    it('Should trunc to two decimals number', () => {
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

        const testsAnalyzer = new TestsAnalyzer(test);

        expect(testsAnalyzer.getFailingTests().length).toBe(1);
        expect(testsAnalyzer.getTests().length).toBe(3);
        expect(testsAnalyzer.getPercentage()).toBe(66.66)
    });

    it('Should count inner tests (inner runnable is undefined)', () => {

        const test: RequisitionModel = {
            name: 'name',
            valid: true,
            tests: [],
        };

        const testsAnalyzer = new TestsAnalyzer(test);

        expect(testsAnalyzer.getFailingTests().length).toBe(0);
        expect(testsAnalyzer.getTests().length).toBe(0);
        expect(testsAnalyzer.getPercentage()).toBe(100);
    });


    it('Should add test', () => {

        const test: RequisitionModel = {
            name: 'name',
            valid: true,
            tests: [{valid: true}],
        };

        const testsAnalyzer = new TestsAnalyzer();
        testsAnalyzer.addTest(test);

        expect(testsAnalyzer.getFailingTests().length).toBe(0);
        expect(testsAnalyzer.getTests().length).toBe(1);
        expect(testsAnalyzer.getPercentage()).toBe(100);
    });


    it('Should get passing tests', () => {

        const test: TestModel = {
            name: 'name',
            description: 'name',
            tests: [{valid: true}, {valid: true}, {valid: true}, {valid: false}],
            valid: true,
        };

        const testsAnalyzer = new TestsAnalyzer(test);

        expect(testsAnalyzer.getFailingTests().length).toBe(1);
        expect(testsAnalyzer.getPassingTests().length).toBe(3);
        expect(testsAnalyzer.getTests().length).toBe(4);
        expect(testsAnalyzer.getPercentage()).toBe(75);
    });

    it('Should count inner tests (no publishers)', () => {
        //(ResultModel | RequisitionModel)
        const test: RequisitionModel = {
            name: 'name',
            valid: true,
            tests: [],
            requisitions: [{
                name: 'name',
                valid: true,
                tests: [{valid: true}],

                type: 'requisition',
                time: {},
                subscriptions: [{
                    name: 'name',
                    valid: true,
                    tests: [{valid: true}],
                }]
            }]
        };

        const testsAnalyzer = new TestsAnalyzer(test);

        expect(testsAnalyzer.getFailingTests().length).toBe(0);
        expect(testsAnalyzer.getTests().length).toBe(2);
        expect(testsAnalyzer.getPercentage()).toBe(100);
    });

    it('Should count inner tests (publishers)', () => {
        //(ResultModel | RequisitionModel)
        const test: RequisitionModel = {
            name: 'name',
            valid: true,
            tests: [],
            type: 'runnable',
            requisitions: [{
                name: 'name',
                valid: true,
                tests: [{valid: true}],

                type: 'requisition',
                time: {},
                subscriptions: [{
                    name: 'name',
                    valid: true,
                    tests: [{valid: true}],
                }],
                publishers: [{
                    name: 'name',
                    valid: true,
                    tests: [{valid: true}],

                }]
            }]
        };

        const testsAnalyzer = new TestsAnalyzer(test);

        expect(testsAnalyzer.getFailingTests().length).toBe(0);
        expect(testsAnalyzer.getTests().length).toBe(3);
        expect(testsAnalyzer.getPercentage()).toBe(100);
    });

    it('Should count really really inner tests', () => {
        const test: RequisitionModel = {
            name: 'name',
            valid: true,
            tests: [{valid: true}],
            requisitions: [{
                name: 'name',
                valid: true,
                tests: [{valid: true}],
                requisitions: [{
                    name: 'name',
                    valid: true,
                    tests: [{valid: true}],
                    requisitions: [{
                        name: 'name',
                        valid: true,
                        tests: [{valid: true}],

                        time: {},
                        subscriptions: [{
                            name: 'name',
                            valid: true,
                            tests: [{valid: true}],
                        }],
                        publishers: [{
                            name: 'name',
                            valid: true,
                            tests: [{valid: true}],

                        }]
                    },{
                        name: 'name',
                        valid: true,
                        tests: [{valid: true}],

                        time: {},
                        subscriptions: [{
                            name: 'name',
                            valid: true,
                            tests: [{valid: true}],
                        }],
                        publishers: [{
                            name: 'name',
                            valid: true,
                            tests: [{valid: true}],

                        }]
                    },{
                        name: 'name',
                        valid: true,
                        tests: [{valid: true}],

                        time: {},
                        subscriptions: [{
                            name: 'name',
                            valid: true,
                            tests: [{valid: true}],
                        }],
                        publishers: [{
                            name: 'name',
                            valid: true,
                            tests: [{valid: true}],

                        }]
                    }]
                }]
            }, {
                name: 'name',
                valid: true,
                tests: [{valid: true}],
                requisitions: [{
                    name: 'name',
                    valid: true,
                    tests: [{valid: true}],

                    time: {},
                    subscriptions: [{
                        name: 'name',
                        valid: true,
                        tests: [{valid: true}],
                    }],
                    publishers: [{
                        name: 'name',
                        valid: true,
                        tests: [{valid: true}],

                    }]
                }]
            }]
        };

        const testsAnalyzer = new TestsAnalyzer(test);

        expect(testsAnalyzer.getFailingTests().length).toBe(0);
        expect(testsAnalyzer.getTests().length).toBe(16);
        expect(testsAnalyzer.getPercentage()).toBe(100);

    });
});
