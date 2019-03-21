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
        asserterManager.addAsserter({equals: 'expected value'},
            () => new ExpectToBeEqualToAsserter());

        const asserter = asserterManager.createAsserter({name: 'any', equals: true});

        expect(asserter).toBeInstanceOf(ExpectToBeEqualToAsserter);
    });

    it('should create Null asserter', () => {
        const asserterManager = new AsserterManager();
        asserterManager.addAsserter({equals: 'expected value'},
            () => new ExpectToBeEqualToAsserter());

        const asserter = asserterManager.createAsserter({name: 'any'});

        expect(asserter).toBeInstanceOf(NullAsserter);
    });

    it('should describe every matching asserter', () => {
        const asserterManager = new AsserterManager();

        asserterManager
            .addAsserter({expect: 'actual value', toBeEqualTo: 'expected value'},
                () => new ExpectToBeEqualToAsserter());
        asserterManager
            .addAsserter({expect: 'actual value', toBeGreaterThan: 'expected value'},
                () => new ExpectToBeEqualToAsserter());
        asserterManager
            .addAsserter({expect: 'actual value', toBeLessThan: 'expected value'},
                () => new ExpectToBeEqualToAsserter());

        const status = asserterManager.describeAsserters('than');

        expect(status).toBeTruthy();
        expect(render).toHaveBeenCalledWith(
            {
                'asserters': [
                    {
                        'expect': 'actual value', 'toBeLessThan': 'expected value'
                    },
                    {
                        'expect': 'actual value',
                        'toBeGreaterThan': 'expected value'
                    }]
            }, expect.anything());
    });

    it('should not describe', () => {
        const asserterManager = new AsserterManager();

        asserterManager
            .addAsserter({expect: 'actual value', toBeEqualTo: 'expected value'},
                () => new ExpectToBeEqualToAsserter());
        asserterManager
            .addAsserter({expect: 'actual value', toBeGreaterThan: 'expected value'},
                () => new ExpectToBeEqualToAsserter());
        asserterManager
            .addAsserter({expect: 'actual value', toBeLessThan: 'expected value'},
                () => new ExpectToBeEqualToAsserter());

        const status = asserterManager.describeAsserters('does not match');

        expect(status).toBeFalsy();
        expect(render).toHaveBeenCalledWith({'asserters': []}, expect.anything());
    });

    it('should describe every asserter', () => {
        const asserterManager = new AsserterManager();

        asserterManager
            .addAsserter({expect: 'actual value', toBeEqualTo: 'expected value'},
                () => new ExpectToBeEqualToAsserter());
        asserterManager
            .addAsserter({expect: 'actual value', toBeGreaterThan: 'expected value'},
                () => new ExpectToBeEqualToAsserter());
        asserterManager
            .addAsserter({expect: 'actual value', toBeLessThan: 'expected value'},
                () => new ExpectToBeEqualToAsserter());

        const status = asserterManager.describeAsserters(true);

        expect(status).toBeTruthy();
        expect(render).toHaveBeenCalledWith({
            'asserters': [
                {
                    'expect': 'actual value', 'toBeLessThan': 'expected value'
                },
                {
                    'expect': 'actual value', 'toBeGreaterThan': 'expected value'
                },
                {
                    'expect': 'actual value', 'toBeEqualTo': 'expected value'
                }]
        }, expect.anything());
    })
    ;

});
