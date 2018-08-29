import {TestsCounter} from "./tests-counter";
import {ResultModel} from "../models/outputs/result-model";

describe('TestsCounter', () => {

    it('Percentage should be zero when there are no tests', () => {
        //(ResultModel | RequisitionModel)
        const test: ResultModel = {
            name: 'name',
            valid: true,
            tests: [],
            type: 'runnable',
            runnables: []
        };

        const testsCounter = new TestsCounter();
        testsCounter.addTests(test);

        expect(testsCounter.getFailingTestsNumber()).toBe(0);
        expect(testsCounter.getTestsNumber()).toBe(0);
        expect(testsCounter.getPercentage()).toBe(0);
    });

    it('Should trunc to two decimals number', () => {
        //(ResultModel | RequisitionModel)
        const test: ResultModel = {
            name: 'name',
            valid: true,
            tests: [{valid: true}],
            type: 'runnable',
            runnables: [{
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

        const test: ResultModel = {
            name: 'name',
            valid: true,
            tests: [{valid: true}],
            type: 'runnable',
            runnables: [{
                name: 'name',
                valid: true,
                tests: [{valid: true}],

                type: 'undefined',
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
        expect(testsCounter.getTestsNumber()).toBe(0);
        expect(testsCounter.getPercentage()).toBe(0);
    });



    it('Should count inner tests (start event is undefined)', () => {
        //(ResultModel | RequisitionModel)
        const test: ResultModel = {
            name: 'name',
            valid: true,
            tests: [{valid: true}],
            type: 'runnable',
            runnables: [{
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
        const test: ResultModel = {
            name: 'name',
            valid: true,
            tests: [{valid: true}],
            type: 'runnable',
            runnables: [{
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
        //(ResultModel | RequisitionModel)
        const test: ResultModel = {
            name: 'name',
            valid: true,
            tests: [{valid: true}],
            type: 'runnable',
            runnables: [{
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
        expect(testsCounter.getTestsNumber()).toBe(4);
        expect(testsCounter.getPercentage()).toBe(100);
    });

    it('Should count really really inner tests', () => {
        //(ResultModel | RequisitionModel)
        const test: ResultModel = {
            name: 'name',
            valid: true,
            tests: [{valid: true}],
            type: 'runnable',
            runnables: [{
                name: 'name',
                valid: true,
                tests: [{valid: true}],
                type: 'runnable',
                runnables: [{
                    name: 'name',
                    valid: true,
                    tests: [{valid: true}],
                    type: 'runnable',
                    runnables: [{
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
                    },{
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
                    },{
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
                }]
            }, {
                name: 'name',
                valid: true,
                tests: [{valid: true}],
                type: 'runnable',
                runnables: [{
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
            }]
        };

        const testsCounter = new TestsCounter();
        testsCounter.addTests(test);

        expect(testsCounter.getFailingTestsNumber()).toBe(0);
        expect(testsCounter.getTestsNumber()).toBe(12);
        expect(testsCounter.getPercentage()).toBe(100);

    });
});
