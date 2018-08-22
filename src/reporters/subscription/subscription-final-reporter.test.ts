import {SubscriptionFinalReporter} from './subscription-final-reporter';

describe('SubscriptionFinalReporter', () => {

    it('No avoidable, no message, no timeout', () => {
        const avoidable = false;
        const hasMessage = false;
        const hasTimedOut = false;
        const finalReporter: SubscriptionFinalReporter = new SubscriptionFinalReporter(avoidable, hasMessage, hasTimedOut);

        const report = finalReporter.getReport();

        expect(report.length).toBe(1);
        expect(report[0].valid).toBeFalsy();
        expect(report[0].name).toBe('Message received');
    });

    it('No avoidable, no message, timeout', () => {
        const avoidable = false;
        const hasMessage = false;
        const hasTimedOut = true;
        const finalReporter: SubscriptionFinalReporter = new SubscriptionFinalReporter(avoidable, hasMessage, hasTimedOut);

        const report = finalReporter.getReport();

        expect(report.length).toBe(2);
        expect(report[0].valid).toBeFalsy();
        expect(report[0].name).toBe('Message received');
        expect(report[1].valid).toBeFalsy();
        expect(report[1].name).toBe('No time out');
    });

    it('No avoidable, message, no timeout', () => {
        const avoidable = false;
        const hasMessage = true;
        const hasTimedOut = false;
        const finalReporter: SubscriptionFinalReporter = new SubscriptionFinalReporter(avoidable, hasMessage, hasTimedOut);

        const report = finalReporter.getReport();

        expect(report.length).toBe(1);
        expect(report[0].valid).toBeTruthy();
        expect(report[0].name).toBe('Message received');
    });

    it('No avoidable, message, timeout', () => {
        const avoidable = false;
        const hasMessage = true;
        const hasTimedOut = true;
        const finalReporter: SubscriptionFinalReporter = new SubscriptionFinalReporter(avoidable, hasMessage, hasTimedOut);

        const report = finalReporter.getReport();

        expect(report.length).toBe(2);
        expect(report[0].valid).toBeTruthy();
        expect(report[0].name).toBe('Message received');
        expect(report[1].valid).toBeFalsy();
        expect(report[1].name).toBe('No time out');

    });

    it('Avoidable, no message, no timeout', () => {
        const avoidable = true;
        const hasMessage = false;
        const hasTimedOut = false;
        const finalReporter: SubscriptionFinalReporter = new SubscriptionFinalReporter(avoidable, hasMessage, hasTimedOut);

        const report = finalReporter.getReport();

        expect(report.length).toBe(1);
        expect(report[0].valid).toBeTruthy();
        expect(report[0].name).toBe('Subscription avoided');
    });

    it('Avoidable, no message, timeout', () => {
        const avoidable = true;
        const hasMessage = false;
        const hasTimedOut = true;
        const finalReporter: SubscriptionFinalReporter = new SubscriptionFinalReporter(avoidable, hasMessage, hasTimedOut);

        const report = finalReporter.getReport();

        expect(report.length).toBe(1);
        expect(report[0].valid).toBeTruthy();
        expect(report[0].name).toBe('Subscription avoided');
    });

    it('Avoidable, message, no timeout', () => {
        const avoidable = true;
        const hasMessage = true;
        const hasTimedOut = false;
        const finalReporter: SubscriptionFinalReporter = new SubscriptionFinalReporter(avoidable, hasMessage, hasTimedOut);

        const report = finalReporter.getReport();

        expect(report.length).toBe(1);
        expect(report[0].valid).toBeFalsy();
        expect(report[0].name).toBe('Subscription avoided');
    });

    it('Avoidable, message, timeout', () => {
        const avoidable = true;
        const hasMessage = true;
        const hasTimedOut = true;
        const finalReporter: SubscriptionFinalReporter = new SubscriptionFinalReporter(avoidable, hasMessage, hasTimedOut);

        const report = finalReporter.getReport();

        expect(report.length).toBe(1);
        expect(report[0].valid).toBeFalsy();
        expect(report[0].name).toBe('Subscription avoided');
    });

});