import { HookReporter } from './hook-reporter';

describe('HookReporter', () => {
    it('Empty constructor', () => {
        const hookReporter: HookReporter = new HookReporter();
        const hookModel = hookReporter.addValues({
            tests: [
                {
                    description: 'some',
                    valid: false,
                    name: 'a'
                },
                {
                    description: 'some2',
                    valid: true,
                    name: 'b'
                }
            ],
            valid: true,
            arguments: { a: 1 }
        });

        expect(hookModel).toEqual({
            arguments: { a: 1 },
            tests: [
                { description: 'some', name: 'a', valid: false },
                { description: 'some2', name: 'b', valid: true }
            ],
            valid: false
        });
    });
    it('Full constructor', () => {
        const hookReporter: HookReporter = new HookReporter({
            tests: [
                {
                    description: 'some',
                    valid: false,
                    name: 'c'
                }
            ],
            valid: true,
            arguments: { c: 1 }
        });
        const hookModel = hookReporter.addValues({
            tests: [
                {
                    description: 'some',
                    valid: true,
                    name: 'a'
                },
                {
                    description: 'some',
                    valid: true,
                    name: 'b'
                }
            ],
            valid: true,
            arguments: { a: 1 }
        });

        expect(hookModel).toEqual({
            arguments: { a: 1, c: 1 },
            tests: [
                {
                    description: 'some',
                    name: 'c',
                    valid: false
                },
                {
                    description: 'some',
                    name: 'a',
                    valid: true
                },
                {
                    description: 'some',
                    name: 'b',
                    valid: true
                }
            ],
            valid: false
        });
    });
});
