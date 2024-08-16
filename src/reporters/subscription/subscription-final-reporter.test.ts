import { SubscriptionFinalReporter } from './subscription-final-reporter';

describe('SubscriptionFinalReporter', () => {
  it('No subscribed, no avoidable, no message, no timeout', () => {
    const subscribed = false;
    const avoidable = false;
    const finalReporter: SubscriptionFinalReporter = new SubscriptionFinalReporter({
      subscribed: subscribed,
      avoidable: avoidable
    });

    const report = finalReporter.getReport();

    expect(report.length).toBe(1);
    expect(report[0].valid).toBeFalsy();
    expect(report[0].implicit).toBeTruthy();
    expect(report[0].name).toBe('Subscribed');
  });

  it('No subscribed, no avoidable, no message, timeout', () => {
    const subscribed = false;
    const avoidable = false;
    const errorDescription = 'error';
    const finalReporter: SubscriptionFinalReporter = new SubscriptionFinalReporter({
      subscribed: subscribed,
      avoidable: avoidable,
      subscribeError: errorDescription
    });

    const report = finalReporter.getReport();

    expect(report.length).toBe(1);
    expect(report[0].valid).toBeFalsy();
    expect(report[0].name).toBe('Subscribed');
    expect(report[0].description).toContain(errorDescription);
    expect(report[0].implicit).toBeTruthy();
  });

  it('No subscribed, no avoidable, message, no timeout', () => {
    const subscribed = false;
    const avoidable = false;
    const finalReporter: SubscriptionFinalReporter = new SubscriptionFinalReporter({
      subscribed: subscribed,
      avoidable: avoidable,
      messageReceived: 'messageReceived'
    });

    const report = finalReporter.getReport();

    expect(report.length).toBe(1);
    expect(report[0].valid).toBeFalsy();
    expect(report[0].name).toBe('Subscribed');
    expect(report[0].implicit).toBeTruthy();
  });

  it('No subscribed, no avoidable, message, timeout', () => {
    const subscribed = false;
    const avoidable = false;
    const finalReporter: SubscriptionFinalReporter = new SubscriptionFinalReporter({
      subscribed: subscribed,
      avoidable: avoidable,
      messageReceived: 'messageReceived',
      time: { timeout: 1000, totalTime: 1001 }
    });

    const report = finalReporter.getReport();

    expect(report.length).toBe(1);
    expect(report[0].valid).toBeFalsy();
    expect(report[0].name).toBe('Subscribed');
    expect(report[0].implicit).toBeTruthy();
  });

  it('No subscribed, avoidable, no message, no timeout', () => {
    const subscribed = false;
    const avoidable = true;
    const finalReporter: SubscriptionFinalReporter = new SubscriptionFinalReporter({
      subscribed: subscribed,
      avoidable: avoidable
    });

    const report = finalReporter.getReport();

    expect(report.length).toBe(1);
    expect(report[0].valid).toBeFalsy();
    expect(report[0].name).toBe('Subscribed');
    expect(report[0].implicit).toBeTruthy();
  });

  it('No subscribed, avoidable, no message, timeout', () => {
    const subscribed = false;
    const avoidable = true;
    const finalReporter: SubscriptionFinalReporter = new SubscriptionFinalReporter({
      subscribed: subscribed,
      avoidable: avoidable,
      time: { timeout: 1000, totalTime: 1001 }
    });

    const report = finalReporter.getReport();

    expect(report.length).toBe(1);
    expect(report[0].valid).toBeFalsy();
    expect(report[0].name).toBe('Subscribed');
    expect(report[0].implicit).toBeTruthy();
  });

  it('No subscribed, avoidable, message, no timeout', () => {
    const subscribed = false;
    const avoidable = true;
    const finalReporter: SubscriptionFinalReporter = new SubscriptionFinalReporter({
      subscribed: subscribed,
      avoidable: avoidable,
      messageReceived: 'messageReceived'
    });

    const report = finalReporter.getReport();

    expect(report.length).toBe(1);
    expect(report[0].valid).toBeFalsy();
    expect(report[0].name).toBe('Subscribed');
    expect(report[0].implicit).toBeTruthy();
  });

  it('No subscribed, avoidable, message, timeout', () => {
    const subscribed = false;
    const avoidable = true;
    const finalReporter: SubscriptionFinalReporter = new SubscriptionFinalReporter({
      subscribed: subscribed,
      avoidable: avoidable,
      messageReceived: 'messageReceived',
      time: { timeout: 1000, totalTime: 1001 }
    });

    const report = finalReporter.getReport();

    expect(report.length).toBe(1);
    expect(report[0].valid).toBeFalsy();
    expect(report[0].name).toBe('Subscribed');
    expect(report[0].implicit).toBeTruthy();
  });

  it('Subscribed, no avoidable, no message, no timeout', () => {
    const subscribed = true;
    const avoidable = false;
    const finalReporter: SubscriptionFinalReporter = new SubscriptionFinalReporter({
      subscribed: subscribed,
      avoidable: avoidable
    });

    const report = finalReporter.getReport();

    expect(report.length).toBe(1);
    expect(report[0].valid).toBeFalsy();
    expect(report[0].name).toBe('Message received');
    expect(report[0].implicit).toBeTruthy();
  });

  it('Subscribed, no avoidable, no message, timeout', () => {
    const subscribed = true;
    const avoidable = false;
    const finalReporter: SubscriptionFinalReporter = new SubscriptionFinalReporter({
      subscribed: subscribed,
      avoidable: avoidable,
      time: { timeout: 1000, totalTime: 1001 }
    });

    const report = finalReporter.getReport();

    expect(report.length).toBe(2);
    expect(report[0].valid).toBeFalsy();
    expect(report[0].name).toBe('Message received');
    expect(report[1].valid).toBeFalsy();
    expect(report[1].name).toBe('No time out');
    expect(report[0].implicit).toBeTruthy();
  });

  it('Ignored', () => {
    const subscribed = true;
    const avoidable = false;
    const finalReporter: SubscriptionFinalReporter = new SubscriptionFinalReporter({
      ignore: true,
      subscribed: subscribed,
      avoidable: avoidable,
      time: { timeout: 1000, totalTime: 1001 }
    });

    const report = finalReporter.getReport();

    expect(report.length).toBe(0);
  });

  it('Subscribed, no avoidable, message, no timeout', () => {
    const subscribed = true;
    const avoidable = false;
    const finalReporter: SubscriptionFinalReporter = new SubscriptionFinalReporter({
      subscribed: subscribed,
      avoidable: avoidable,
      messageReceived: 'messageReceived'
    });

    const report = finalReporter.getReport();

    expect(report.length).toBe(1);
    expect(report[0].valid).toBeTruthy();
    expect(report[0].name).toBe('Message received');
    expect(report[0].description).toBe('messageReceived');
    expect(report[0].implicit).toBeTruthy();
  });

  it('Subscribed, no avoidable, message, timeout', () => {
    const subscribed = true;
    const avoidable = false;
    const finalReporter: SubscriptionFinalReporter = new SubscriptionFinalReporter({
      subscribed: subscribed,
      avoidable: avoidable,
      messageReceived: 'messageReceived',
      time: { timeout: 1000, totalTime: 1001 }
    });

    const report = finalReporter.getReport();

    expect(report.length).toBe(2);
    expect(report[0].valid).toBeTruthy();
    expect(report[0].name).toBe('Message received');
    expect(report[0].implicit).toBeTruthy();
    expect(report[0].description).toBe('messageReceived');
    expect(report[1].valid).toBeFalsy();
    expect(report[1].name).toBe('No time out');
    expect(report[1].implicit).toBeTruthy();
  });

  it('Subscribed, avoidable, no message, no timeout', () => {
    const subscribed = true;
    const avoidable = true;
    const finalReporter: SubscriptionFinalReporter = new SubscriptionFinalReporter({
      subscribed: subscribed,
      avoidable: avoidable
    });

    const report = finalReporter.getReport();

    expect(report.length).toBe(1);
    expect(report[0].valid).toBeTruthy();
    expect(report[0].name).toBe('Subscription avoided');
    expect(report[0].implicit).toBeTruthy();
  });

  it('Subscribed, avoidable, no message, timeout', () => {
    const subscribed = true;
    const avoidable = true;
    const finalReporter: SubscriptionFinalReporter = new SubscriptionFinalReporter({
      subscribed: subscribed,
      avoidable: avoidable,
      time: { timeout: 1000, totalTime: 1001 }
    });

    const report = finalReporter.getReport();

    expect(report.length).toBe(1);
    expect(report[0].valid).toBeTruthy();
    expect(report[0].name).toBe('Subscription avoided');
    expect(report[0].implicit).toBeTruthy();
  });

  it('Subscribed, avoidable, message, no timeout', () => {
    const subscribed = true;
    const avoidable = true;
    const finalReporter: SubscriptionFinalReporter = new SubscriptionFinalReporter({
      subscribed: subscribed,
      avoidable: avoidable,
      messageReceived: 'messageReceived'
    });

    const report = finalReporter.getReport();

    expect(report.length).toBe(1);
    expect(report[0].valid).toBeFalsy();
    expect(report[0].name).toBe('Subscription avoided');
    expect(report[0].implicit).toBeTruthy();
  });

  it('Subscribed, avoidable, message, timeout', () => {
    const subscribed = true;
    const avoidable = true;
    const finalReporter: SubscriptionFinalReporter = new SubscriptionFinalReporter({
      subscribed: subscribed,
      avoidable: avoidable,
      messageReceived: 'messageReceived',
      time: { timeout: 1000, totalTime: 1001 }
    });

    const report = finalReporter.getReport();

    expect(report.length).toBe(1);
    expect(report[0].valid).toBeFalsy();
    expect(report[0].name).toBe('Subscription avoided');
    expect(report[0].implicit).toBeTruthy();
  });
});
