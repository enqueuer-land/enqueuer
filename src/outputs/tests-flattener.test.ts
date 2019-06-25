import {TestsFlattener} from './tests-flattener';
import {ReportModel} from '../models/outputs/report-model';

describe('TestsFlattener', () => {
    it('Flattens requisitions', () => {
        const requisition: ReportModel = {
            name: 'requisition',
            valid: true,
            hooks: {
                onHook: {
                    valid: true,
                    tests: [{
                        description: 'description',
                        name: 'test',
                        valid: true,
                    }]
                }
            }
        };

        const flattenTests = new TestsFlattener().flatten(requisition);
        expect(flattenTests).toEqual([{'description': 'description', 'hierarchy': ['requisition', 'onHook'], 'name': 'test', 'valid': true}]);
    });

    it('Concatenates requisition #', () => {
        const requisition: ReportModel = {
            name: 'requisition',
            iteration: 4,
            totalIterations: 5,
            valid: true,
            hooks: {
                onHook: {
                    valid: true,
                    tests: [{
                        description: 'description',
                        name: 'test',
                        valid: true,
                    }]
                }
            }
        };

        const flattenTests = new TestsFlattener().flatten(requisition);
        expect(flattenTests).toEqual([{'description': 'description', 'hierarchy': ['requisition [4]', 'onHook'], 'name': 'test', 'valid': true}]);
    });

    it('Handle empty hooks', () => {
        const requisition: ReportModel = {
            name: 'requisition',
            iteration: 4,
            totalIterations: 5,
            valid: true,
            hooks: {}
        };

        const flattenTests = new TestsFlattener().flatten(requisition);
        expect(flattenTests).toEqual([]);
    });

    it('Flatten deeper publishers', () => {
        const requisition: ReportModel = {
            name: 'requisition',
            valid: true,
            publishers: [{
                name: 'publisher',
                hooks: {
                    onHook: {
                        valid: true,
                        tests: [{
                            description: 'description',
                            name: 'test',
                            valid: true,
                        }]
                    }
                }
            }]
        };

        const flattenTests = new TestsFlattener().flatten(requisition);
        expect(flattenTests).toEqual([{
            'description': 'description',
            'hierarchy': ['requisition', 'publisher', 'onHook'],
            'name': 'test',
            'valid': true
        }]);
    });

    it('Flatten deeper subscriptions', () => {
        const requisition: ReportModel = {
            name: 'requisition',
            valid: true,
            subscriptions: [{
                name: 'subscription',
                hooks: {
                    onHook: {
                        valid: true,
                        tests: [{
                            description: 'description',
                            name: 'test',
                            valid: true,
                        }]
                    }
                }
            }]
        };

        const flattenTests = new TestsFlattener().flatten(requisition);
        expect(flattenTests).toEqual([{
            'description': 'description',
            'hierarchy': ['requisition', 'subscription', 'onHook'],
            'name': 'test',
            'valid': true
        }]);
    });

    it('Flatten deeper requisitions', () => {
        const requisition: ReportModel = {
            name: 'requisition',
            valid: true,
            requisitions: [{
                name: 'requisition',
                iteration: 3,
                totalIterations: 5,
                hooks: {
                    onHook: {
                        valid: true,
                        tests: [{
                            description: 'description',
                            name: 'test',
                            valid: true,
                        }]
                    }
                }
            }]
        };

        const flattenTests = new TestsFlattener().flatten(requisition);
        expect(flattenTests).toEqual([{
            'description': 'description',
            'hierarchy': ['requisition', 'requisition [3]', 'onHook'],
            'name': 'test',
            'valid': true
        }]);
    });

});
