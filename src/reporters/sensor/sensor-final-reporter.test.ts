import { SensorFinalReporter } from './sensor-final-reporter';

describe('SensorFinalReporter', () => {
  it('No mounted, no avoidable, no message, no timeout', () => {
    const mounted = false;
    const avoidable = false;
    const finalReporter: SensorFinalReporter = new SensorFinalReporter({
      mounted: mounted,
      avoidable: avoidable
    });

    const report = finalReporter.getReport();

    expect(report.length).toBe(1);
    expect(report[0].valid).toBeFalsy();
    expect(report[0].implicit).toBeTruthy();
    expect(report[0].name).toBe('Prepared');
  });

  it('No mounted, no avoidable, no message, timeout', () => {
    const mounted = false;
    const avoidable = false;
    const errorDescription = 'error';
    const finalReporter: SensorFinalReporter = new SensorFinalReporter({
      mounted: mounted,
      avoidable: avoidable,
      mountError: errorDescription
    });

    const report = finalReporter.getReport();

    expect(report.length).toBe(1);
    expect(report[0].valid).toBeFalsy();
    expect(report[0].name).toBe('Prepared');
    expect(report[0].description).toContain(errorDescription);
    expect(report[0].implicit).toBeTruthy();
  });

  it('No mounted, no avoidable, message, no timeout', () => {
    const mounted = false;
    const avoidable = false;
    const finalReporter: SensorFinalReporter = new SensorFinalReporter({
      mounted: mounted,
      avoidable: avoidable,
      messageReceived: 'messageReceived'
    });

    const report = finalReporter.getReport();

    expect(report.length).toBe(1);
    expect(report[0].valid).toBeFalsy();
    expect(report[0].name).toBe('Prepared');
    expect(report[0].implicit).toBeTruthy();
  });

  it('No mounted, no avoidable, message, timeout', () => {
    const mounted = false;
    const avoidable = false;
    const finalReporter: SensorFinalReporter = new SensorFinalReporter({
      mounted: mounted,
      avoidable: avoidable,
      messageReceived: 'messageReceived',
      time: { timeout: 1000, totalTime: 1001 }
    });

    const report = finalReporter.getReport();

    expect(report.length).toBe(1);
    expect(report[0].valid).toBeFalsy();
    expect(report[0].name).toBe('Prepared');
    expect(report[0].implicit).toBeTruthy();
  });

  it('No mounted, avoidable, no message, no timeout', () => {
    const mounted = false;
    const avoidable = true;
    const finalReporter: SensorFinalReporter = new SensorFinalReporter({
      mounted: mounted,
      avoidable: avoidable
    });

    const report = finalReporter.getReport();

    expect(report.length).toBe(1);
    expect(report[0].valid).toBeFalsy();
    expect(report[0].name).toBe('Prepared');
    expect(report[0].implicit).toBeTruthy();
  });

  it('No mounted, avoidable, no message, timeout', () => {
    const mounted = false;
    const avoidable = true;
    const finalReporter: SensorFinalReporter = new SensorFinalReporter({
      mounted: mounted,
      avoidable: avoidable,
      time: { timeout: 1000, totalTime: 1001 }
    });

    const report = finalReporter.getReport();

    expect(report.length).toBe(1);
    expect(report[0].valid).toBeFalsy();
    expect(report[0].name).toBe('Prepared');
    expect(report[0].implicit).toBeTruthy();
  });

  it('No mounted, avoidable, message, no timeout', () => {
    const mounted = false;
    const avoidable = true;
    const finalReporter: SensorFinalReporter = new SensorFinalReporter({
      mounted: mounted,
      avoidable: avoidable,
      messageReceived: 'messageReceived'
    });

    const report = finalReporter.getReport();

    expect(report.length).toBe(1);
    expect(report[0].valid).toBeFalsy();
    expect(report[0].name).toBe('Prepared');
    expect(report[0].implicit).toBeTruthy();
  });

  it('No mounted, avoidable, message, timeout', () => {
    const mounted = false;
    const avoidable = true;
    const finalReporter: SensorFinalReporter = new SensorFinalReporter({
      mounted: mounted,
      avoidable: avoidable,
      messageReceived: 'messageReceived',
      time: { timeout: 1000, totalTime: 1001 }
    });

    const report = finalReporter.getReport();

    expect(report.length).toBe(1);
    expect(report[0].valid).toBeFalsy();
    expect(report[0].name).toBe('Prepared');
    expect(report[0].implicit).toBeTruthy();
  });

  it('Prepared, no avoidable, no message, no timeout', () => {
    const mounted = true;
    const avoidable = false;
    const finalReporter: SensorFinalReporter = new SensorFinalReporter({
      mounted: mounted,
      avoidable: avoidable
    });

    const report = finalReporter.getReport();

    expect(report.length).toBe(1);
    expect(report[0].valid).toBeFalsy();
    expect(report[0].name).toBe('Message received');
    expect(report[0].implicit).toBeTruthy();
  });

  it('Prepared, no avoidable, no message, timeout', () => {
    const mounted = true;
    const avoidable = false;
    const finalReporter: SensorFinalReporter = new SensorFinalReporter({
      mounted: mounted,
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
    const mounted = true;
    const avoidable = false;
    const finalReporter: SensorFinalReporter = new SensorFinalReporter({
      ignore: true,
      mounted: mounted,
      avoidable: avoidable,
      time: { timeout: 1000, totalTime: 1001 }
    });

    const report = finalReporter.getReport();

    expect(report.length).toBe(0);
  });

  it('Prepared, no avoidable, message, no timeout', () => {
    const mounted = true;
    const avoidable = false;
    const finalReporter: SensorFinalReporter = new SensorFinalReporter({
      mounted: mounted,
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

  it('Prepared, no avoidable, message, timeout', () => {
    const mounted = true;
    const avoidable = false;
    const finalReporter: SensorFinalReporter = new SensorFinalReporter({
      mounted: mounted,
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

  it('Prepared, avoidable, no message, no timeout', () => {
    const mounted = true;
    const avoidable = true;
    const finalReporter: SensorFinalReporter = new SensorFinalReporter({
      mounted: mounted,
      avoidable: avoidable
    });

    const report = finalReporter.getReport();

    expect(report.length).toBe(1);
    expect(report[0].valid).toBeTruthy();
    expect(report[0].name).toBe('Sensor avoided');
    expect(report[0].implicit).toBeTruthy();
  });

  it('Prepared, avoidable, no message, timeout', () => {
    const mounted = true;
    const avoidable = true;
    const finalReporter: SensorFinalReporter = new SensorFinalReporter({
      mounted: mounted,
      avoidable: avoidable,
      time: { timeout: 1000, totalTime: 1001 }
    });

    const report = finalReporter.getReport();

    expect(report.length).toBe(1);
    expect(report[0].valid).toBeTruthy();
    expect(report[0].name).toBe('Sensor avoided');
    expect(report[0].implicit).toBeTruthy();
  });

  it('Prepared, avoidable, message, no timeout', () => {
    const mounted = true;
    const avoidable = true;
    const finalReporter: SensorFinalReporter = new SensorFinalReporter({
      mounted: mounted,
      avoidable: avoidable,
      messageReceived: 'messageReceived'
    });

    const report = finalReporter.getReport();

    expect(report.length).toBe(1);
    expect(report[0].valid).toBeFalsy();
    expect(report[0].name).toBe('Sensor avoided');
    expect(report[0].implicit).toBeTruthy();
  });

  it('Prepared, avoidable, message, timeout', () => {
    const mounted = true;
    const avoidable = true;
    const finalReporter: SensorFinalReporter = new SensorFinalReporter({
      mounted: mounted,
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
