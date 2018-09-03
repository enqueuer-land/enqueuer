import {TestsCounter} from "./tests-counter";
import {RequisitionModel} from "../models/outputs/requisition-model";

describe('TestsCounter', () => {

    it('Percentage should be zero when there are no tests', () => {
        const test: RequisitionModel = {
            name: 'name',
            valid: true,
            tests: []
        };

        const testsCounter = new TestsCounter();
        testsCounter.addTests(test);

        expect(testsCounter.getFailingTestsNumber()).toBe(0);
        expect(testsCounter.getTestsNumber()).toBe(0);
        expect(testsCounter.getPercentage()).toBe(0);
    });

    it('Should trunc to two decimals number', () => {
        //(ResultModel | RequisitionModel)
        const test: RequisitionModel = {
            name: 'name',
            valid: true,
            tests: [{valid: true}],
            requisitions: [{
                name: 'name',
                valid: true,
                tests: [{valid: true}],

                time: {},
                startEvent: {
                    publisher: {
                        name: 'name',
                        valid: true,
                        tests: [{valid: false}],

                    }
                }
            }]
        };

        const testsCounter = new TestsCounter();
        testsCounter.addTests(test);

        expect(testsCounter.getFailingTestsNumber()).toBe(1);
        expect(testsCounter.getTestsNumber()).toBe(3);
        expect(testsCounter.getPercentage()).toBe(66.66)
    });

    it('Should count inner tests (inner runnable is undefined)', () => {

        const test: RequisitionModel = {
            name: 'name',
            valid: true,
            tests: [],
            type: 'runnable'
        };

        const testsCounter = new TestsCounter();
        testsCounter.addTests(test);

        expect(testsCounter.getFailingTestsNumber()).toBe(0);
        expect(testsCounter.getTestsNumber()).toBe(0);
        expect(testsCounter.getPercentage()).toBe(0);
    });



    it('Should count inner tests (start event is undefined)', () => {
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
                }],
                startEvent: {}
            }]
        };

        const testsCounter = new TestsCounter();
        testsCounter.addTests(test);

        expect(testsCounter.getFailingTestsNumber()).toBe(0);
        expect(testsCounter.getTestsNumber()).toBe(2);
        expect(testsCounter.getPercentage()).toBe(100);
    });

    it('Should count inner tests (start event is publisher)', () => {
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
                startEvent: {
                    publisher: {
                        name: 'name',
                        valid: true,
                        tests: [{valid: true}],

                    }
                }
            }]
        };

        const testsCounter = new TestsCounter();
        testsCounter.addTests(test);

        expect(testsCounter.getFailingTestsNumber()).toBe(0);
        expect(testsCounter.getTestsNumber()).toBe(3);
        expect(testsCounter.getPercentage()).toBe(100);
    });

    it('Should count inner tests (start event is subscription)', () => {
        const test: RequisitionModel = {
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
                startEvent: {
                    subscription: {
                        name: 'name',
                        valid: true,
                        tests: [{valid: true}, {valid: true}],

                    }
                }
            }]
        };

        const testsCounter = new TestsCounter();
        testsCounter.addTests(test);

        expect(testsCounter.getFailingTestsNumber()).toBe(0);
        expect(testsCounter.getTestsNumber()).toBe(5);
        expect(testsCounter.getPercentage()).toBe(100);
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
                        startEvent: {
                            publisher: {
                                name: 'name',
                                valid: true,
                                tests: [{valid: true}],

                            }
                        }
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
                        startEvent: {
                            publisher: {
                                name: 'name',
                                valid: true,
                                tests: [{valid: true}],

                            }
                        }
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
                        startEvent: {
                            publisher: {
                                name: 'name',
                                valid: true,
                                tests: [{valid: true}],

                            }
                        }
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
                    startEvent: {
                        publisher: {
                            name: 'name',
                            valid: true,
                            tests: [{valid: true}],

                        }
                    }
                }]
            }]
        };

        const testsCounter = new TestsCounter();
        testsCounter.addTests(test);

        expect(testsCounter.getFailingTestsNumber()).toBe(0);
        expect(testsCounter.getTestsNumber()).toBe(16);
        expect(testsCounter.getPercentage()).toBe(100);

    });
});
