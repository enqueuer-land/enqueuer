import { ActuatorReporter } from './actuator-reporter';
import { MultiActuatorsReporter } from './multi-actuators-reporter';

jest.mock('./actuator-reporter');

let act = jest.fn();
let onFinishMock = jest.fn(() => {
  return 'onFinishMockStr';
});
let getReportMock = jest.fn(() => {
  return 'getReportMockStr';
});

const recreateMock = () => {
  // @ts-expect-error
  ActuatorReporter.mockImplementation(() => {
    return {
      act: act,
      onFinish: onFinishMock,
      getReport: getReportMock
    };
  });
};

let clearMock = function () {
  // @ts-expect-error
  ActuatorReporter.mockClear();
  act.mockClear();
  onFinishMock.mockClear();
  getReportMock.mockReset();
};

describe('MultiActuatorsReporter', () => {
  beforeEach(() => {
    recreateMock();
  });

  afterEach(() => {
    clearMock();
  });

  it('Call publishReporter constructors', () => {
    const actuators = [{ name: 'first' }, { name: 'second' }] as any;
    new MultiActuatorsReporter(actuators);

    expect(ActuatorReporter).toHaveBeenCalledTimes(actuators.length);
    expect(ActuatorReporter).toHaveBeenCalledWith({ name: 'first' });
    expect(ActuatorReporter).toHaveBeenCalledWith({ name: 'second' });
  });

  it('Call publishReporter constructors empty actuators', () => {
    new MultiActuatorsReporter([]);

    expect(ActuatorReporter).toHaveBeenCalledTimes(0);
  });

  it('should handle success', done => {
    act.mockImplementation(() => Promise.resolve());
    recreateMock();

    const actuators = [{}, {}] as any;
    new MultiActuatorsReporter(actuators).act().then(() => {
      done();
    });

    expect(act).toHaveBeenCalledTimes(actuators.length);
  });

  it('should handle be success when no actuator is given', done => {
    new MultiActuatorsReporter([]).act().then(() => {
      done();
    });

    expect(act).toHaveBeenCalledTimes(0);
  });

  it('should handle fail publishing', async () => {
    act.mockImplementationOnce(() => Promise.resolve());
    act.mockImplementationOnce(() => Promise.reject('err reason'));
    recreateMock();

    const actuators = [{}, {}] as any;
    await new MultiActuatorsReporter(actuators).act();
    expect(act).toHaveBeenCalledTimes(actuators.length);
  });

  it('should call onFinish', () => {
    const actuators = [{}, {}] as any;

    new MultiActuatorsReporter(actuators).onFinish();
    expect(onFinishMock).toHaveBeenCalledTimes(actuators.length);
  });

  it('should call getReport', () => {
    const actuators = [{}, {}] as any;

    const report = new MultiActuatorsReporter(actuators).getReport();
    expect(report.length).toBe(actuators.length);
    expect(getReportMock).toHaveBeenCalledTimes(actuators.length);
  });
});
