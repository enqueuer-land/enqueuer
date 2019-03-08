import {IterationsEvaluator} from "./iterations-evaluator";

describe('IterationsEvaluator', () => {

    it('Should return 0 when no requisition', () => {

        expect(new IterationsEvaluator().evaluate()).toBe(0);
    });

    it('Should return 1 when no iterations', () => {
        expect(new IterationsEvaluator().evaluate({})).toBe(1);
    });

    it('Should return 1 when true', () => {
        expect(new IterationsEvaluator().evaluate({iterations: '1 === 1'})).toBe(1);
    });

    it('Should return 0 when false', () => {
        expect(new IterationsEvaluator().evaluate({iterations: '1 === 0'})).toBe(0);
    });

    it('Should parse string', () => {
        expect(new IterationsEvaluator().evaluate({iterations: '10'})).toBe(10);
    });

    it('Should catch exceptions and return 0', () => {
        expect(new IterationsEvaluator().evaluate({iterations: 'virgs'})).toBe(0);
    });

    it('Should accept number', () => {
        expect(new IterationsEvaluator().evaluate({iterations: 100})).toBe(100);
    });
});
