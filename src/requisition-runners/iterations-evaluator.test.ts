import { IterationsEvaluator } from './iterations-evaluator';

describe('IterationsEvaluator', () => {
    it('Should return 1 when undefined', () => {
        // @ts-ignore
        expect(new IterationsEvaluator().iterations()).toBe(1);
    });

    it('Should return 1 when true', () => {
        // @ts-ignore
        expect(new IterationsEvaluator().iterations('1 === 1')).toBe(1);
    });

    it('Should return 0 when false', () => {
        // @ts-ignore
        expect(new IterationsEvaluator().iterations('1 === 0')).toBe(0);
    });

    it('Should parse string', () => {
        // @ts-ignore
        expect(new IterationsEvaluator().iterations('10')).toBe(10);
    });

    it('Should catch exceptions and return 0', () => {
        // @ts-ignore
        expect(new IterationsEvaluator().iterations('throw "gui"')).toBe(0);
    });

    it('Should accept number', () => {
        expect(new IterationsEvaluator().iterations(100)).toBe(100);
    });
});
