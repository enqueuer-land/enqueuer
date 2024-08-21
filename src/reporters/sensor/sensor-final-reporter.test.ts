import { SensorFinalReporter } from './sensor-final-reporter';

describe('SensorFinalReporter', () => {
  it('No getReadyd, no avoidable, no message, no timeout', () => {
    const getReadyd = false;
    const avoidable = false;
    const finalReporter: SensorFinalReporter = new SensorFinalReporter({
      getReadyd: getReadyd,
      avoidable: avoidable
    });

    const report = finalReporter.getReport();

    expect(report.length).toBe(1);
    expect(report[0].valid).toBeFalsy();
    expect(report[0].implicit).toBeTruthy();
    expect(report[0].name).toBe('Subscribed');
  });

  it('No getReadyd, no avoidable, no message, timeout', () => {
    const getReadyd = false;
    const avoidable = false;
    const errorDescription = 'error';
    const finalReporter: SensorFinalReporter = new SensorFinalReporter({
      getReadyd: getReadyd,
      avoidable: avoidable,
      getReadyError: errorDescription
    });

    const report = finalReporter.getReport();

    expect(report.length).toBe(1);
    expect(report[0].valid).toBeFalsy();
    expect(report[0].name).toBe('Subscribed');
    expect(report[0].description).toContain(errorDescription);
    expect(report[0].implicit).toBeTruthy();
  });

  it('No getReadyd, no avoidable, message, no timeout', () => {
    const getReadyd = false;
    const avoidable = false;
    const finalReporter: SensorFinalReporter = new SensorFinalReporter({
      getReadyd: getReadyd,
      avoidable: avoidable,
      messageReceived: 'messageReceived'
    });

    const report = finalReporter.getReport();

    expect(report.length).toBe(1);
    expect(report[0].valid).toBeFalsy();
    expect(report[0].name).toBe('Subscribed');
    expect(report[0].implicit).toBeTruthy();
  });

  it('No getReadyd, no avoidable, message, timeout', () => {
    const getReadyd = false;
    const avoidable = false;
    const finalReporter: SensorFinalReporter = new SensorFinalReporter({
      getReadyd: getReadyd,
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

  it('No getReadyd, avoidable, no message, no timeout', () => {
    const getReadyd = false;
    const avoidable = true;
    const finalReporter: SensorFinalReporter = new SensorFinalReporter({
      getReadyd: getReadyd,
      avoidable: avoidable
    });

    const report = finalReporter.getReport();

    expect(report.length).toBe(1);
    expect(report[0].valid).toBeFalsy();
    expect(report[0].name).toBe('Subscribed');
    expect(report[0].implicit).toBeTruthy();
  });

  it('No getReadyd, avoidable, no message, timeout', () => {
    const getReadyd = false;
    const avoidable = true;
    const finalReporter: SensorFinalReporter = new SensorFinalReporter({
      getReadyd: getReadyd,
      avoidable: avoidable,
      time: { timeout: 1000, totalTime: 1001 }
    });

    const report = finalReporter.getReport();

    expect(report.length).toBe(1);
    expect(report[0].valid).toBeFalsy();
    expect(report[0].name).toBe('Subscribed');
    expect(report[0].implicit).toBeTruthy();
  });

  it('No getReadyd, avoidable, message, no timeout', () => {
    const getReadyd = false;
    const avoidable = true;
    const finalReporter: SensorFinalReporter = new SensorFinalReporter({
      getReadyd: getReadyd,
      avoidable: avoidable,
      messageReceived: 'messageReceived'
    });

    const report = finalReporter.getReport();

    expect(report.length).toBe(1);
    expect(report[0].valid).toBeFalsy();
    expect(report[0].name).toBe('Subscribed');
    expect(report[0].implicit).toBeTruthy();
  });

  it('No getReadyd, avoidable, message, timeout', () => {
    const getReadyd = false;
    const avoidable = true;
    const finalReporter: SensorFinalReporter = new SensorFinalReporter({
      getReadyd: getReadyd,
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
    const getReadyd = true;
    const avoidable = false;
    const finalReporter: SensorFinalReporter = new SensorFinalReporter({
      getReadyd: getReadyd,
      avoidable: avoidable
    });

    const report = finalReporter.getReport();

    expect(report.length).toBe(1);
    expect(report[0].valid).toBeFalsy();
    expect(report[0].name).toBe('Message received');
    expect(report[0].implicit).toBeTruthy();
  });

  it('Subscribed, no avoidable, no message, timeout', () => {
    const getReadyd = true;
    const avoidable = false;
    const finalReporter: SensorFinalReporter = new SensorFinalReporter({
      getReadyd: getReadyd,
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
    const getReadyd = true;
    const avoidable = false;
    const finalReporter: SensorFinalReporter = new SensorFinalReporter({
      ignore: true,
      getReadyd: getReadyd,
      avoidable: avoidable,
      time: { timeout: 1000, totalTime: 1001 }
    });

    const report = finalReporter.getReport();

    expect(report.length).toBe(0);
  });

  it('Subscribed, no avoidable, message, no timeout', () => {
    const getReadyd = true;
    const avoidable = false;
    const finalReporter: SensorFinalReporter = new SensorFinalReporter({
      getReadyd: getReadyd,
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
    const getReadyd = true;
    const avoidable = false;
    const finalReporter: SensorFinalReporter = new SensorFinalReporter({
      getReadyd: getReadyd,
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
    const getReadyd = true;
    const avoidable = true;
    const finalReporter: SensorFinalReporter = new SensorFinalReporter({
      getReadyd: getReadyd,
      avoidable: avoidable
    });

    const report = finalReporter.getReport();

    expect(report.length).toBe(1);
    expect(report[0].valid).toBeTruthy();
    expect(report[0].name).toBe('Sensor avoided');
    expect(report[0].implicit).toBeTruthy();
  });

  it('Subscribed, avoidable, no message, timeout', () => {
    const getReadyd = true;
    const avoidable = true;
    const finalReporter: SensorFinalReporter = new SensorFinalReporter({
      getReadyd: getReadyd,
      avoidable: avoidable,
      time: { timeout: 1000, totalTime: 1001 }
    });

    const report = finalReporter.getReport();

    expect(report.length).toBe(1);
    expect(report[0].valid).toBeTruthy();
    expect(report[0].name).toBe('Sensor avoided');
    expect(report[0].implicit).toBeTruthy();
  });

  it('Subscribed, avoidable, message, no timeout', () => {
    const getReadyd = true;
    const avoidable = true;
    const finalReporter: SensorFinalReporter = new SensorFinalReporter({
      getReadyd: getReadyd,
      avoidable: avoidable,
      messageReceived: 'messageReceived'
    });

    const report = finalReporter.getReport();

    expect(report.length).toBe(1);
    expect(report[0].valid).toBeFalsy();
    expect(report[0].name).toBe('Sensor avoided');
    expect(report[0].implicit).toBeTruthy();
  });

  it('Subscribed, avoidable, message, timeout', () => {
    const getReadyd = true;
    const avoidable = true;
    const finalReporter: SensorFinalReporter = new SensorFinalReporter({
      getReadyd: getReadyd,
      avoidable: avoidable,
      messageReceived: 'messageReceived',
      time: { timeout: 1000, totalTime: 1001 }
    });

    const report = finalReporter.getReport();

    expect(report.length).toBe(1);
    expect(report[0].valid).toBeFalsy();
    expect(report[0].name).toBe('Sensor avoided');
    expect(report[0].implicit).toBeTruthy();
  });
});
