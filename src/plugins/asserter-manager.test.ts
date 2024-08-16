import {AsserterManager} from './asserter-manager';
import {ExpectToBeEqualToAsserter} from '../asserters/expect-to-be-equal-to-asserter';
import {NullAsserter} from '../asserters/null-asserter';
import prettyjson from 'prettyjson';

jest.mock('prettyjson');

const render = jest.fn();
// @ts-ignore
prettyjson.render.mockImplementation(render);

describe('AsserterManager', () => {
    it('should create proper asserter', () => {
        const asserterManager = new AsserterManager();
        asserterManager.addAsserter({equals: {description: 'some', type: 'string'}}, () => new ExpectToBeEqualToAsserter());

        const asserter = asserterManager.createAsserter({
            name: 'any',
            equals: true
        });

        expect(asserter).toBeInstanceOf(ExpectToBeEqualToAsserter);
    });

    it('should create proper asserter ignoring not required ones', () => {
        const asserterManager = new AsserterManager();
        asserterManager.addAsserter(
            {
                equals: {
                    description: 'some',
                    type: 'string'
                },
                not: {
                    required: false,
                    description: 'some',
                    type: 'null'
                }
            },
            () => new ExpectToBeEqualToAsserter()
        );

        const asserter = asserterManager.createAsserter({
            name: 'any',
            equals: true
        });

        expect(asserter).toBeInstanceOf(ExpectToBeEqualToAsserter);
    });

    it('should create Null asserter', () => {
        const asserterManager = new AsserterManager();
        asserterManager.addAsserter({equals: {description: 'some', type: 'string'}}, () => new ExpectToBeEqualToAsserter());

        const asserter = asserterManager.createAsserter({name: 'any'});

        expect(asserter).toBeInstanceOf(NullAsserter);
    });

    it('should describe every matching asserter', () => {
        const asserterManager = new AsserterManager();

        asserterManager.addAsserter({toBeEqualTo: {description: 'some', type: 'string'}}, () => new ExpectToBeEqualToAsserter());
        asserterManager.addAsserter({toBeGreaterThan: {description: 'some', type: 'string'}}, () => new ExpectToBeEqualToAsserter());
        asserterManager.addAsserter({toBeLessThan: {description: 'some', type: 'string'}}, () => new ExpectToBeEqualToAsserter());

        const status = asserterManager.describeMatchingAsserters('than');

        expect(status).toBeTruthy();
        expect(render).toHaveBeenCalledWith(
            {
                asserters: [
                    {
                        toBeLessThan: {
                            description: 'some',
                            required: true,
                            type: 'string'
                        }
                    },
                    {
                        toBeGreaterThan: {
                            description: 'some',
                            required: true,
                            type: 'string'
                        }
                    }
                ]
            },
            expect.anything()
        );
    });

    it('should not describe', () => {
        const asserterManager = new AsserterManager();

        asserterManager.addAsserter({toBeEqualTo: {description: 'some', type: 'string'}}, () => new ExpectToBeEqualToAsserter());
        asserterManager.addAsserter({toBeGreaterThan: {description: 'some', type: 'string'}}, () => new ExpectToBeEqualToAsserter());
        asserterManager.addAsserter({toBeLessThan: {description: 'some', type: 'string'}}, () => new ExpectToBeEqualToAsserter());

        const status = asserterManager.describeMatchingAsserters('does not match');

        expect(status).toBeFalsy();
        expect(render).toHaveBeenCalledWith({asserters: []}, expect.anything());
    });

    it('should describe every asserter', () => {
        const asserterManager = new AsserterManager();

        asserterManager.addAsserter({toBeEqualTo: {description: 'some', type: 'string'}}, () => new ExpectToBeEqualToAsserter());
        asserterManager.addAsserter({toBeGreaterThan: {description: 'some', type: 'string'}}, () => new ExpectToBeEqualToAsserter());
        asserterManager.addAsserter({toBeLessThan: {description: 'some'}}, () => new ExpectToBeEqualToAsserter());

        const status = asserterManager.describeMatchingAsserters(true);

        expect(status).toBeTruthy();
        expect(render).toHaveBeenCalledWith(
            {
                asserters: [
                    {
                        toBeLessThan: {
                            description: 'some',
                            required: true,
                            type: 'any'
                        }
                    },
                    {
                        toBeGreaterThan: {
                            description: 'some',
                            required: true,
                            type: 'string'
                        }
                    },
                    {
                        toBeEqualTo: {
                            description: 'some',
                            required: true,
                            type: 'string'
                        }
                    }
                ]
            },
            expect.anything()
        );
    });
});
