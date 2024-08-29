import { SensorReporter } from './sensor-reporter';
import { MultiSensorsReporter } from './multi-sensors-reporter';

let startTimeoutMock = jest.fn(() => {});
let onFinishMock = jest.fn();
let hasFinishedMock = jest.fn();
// @ts-expect-error
let mountMock = jest.fn(() => new Promise());
// @ts-expect-error
let receiveMessageMock = jest.fn(() => new Promise());
let getReportMock: any;
let SensorReporterMock = jest.fn(() => {
  return {
    startTimeout: startTimeoutMock,
    hasFinished: hasFinishedMock,
    mount: mountMock,
    onFinish: onFinishMock,
    receiveMessage: receiveMessageMock,
    getReport: getReportMock
  };
});

jest.mock('../sensor/sensor-reporter');
// @ts-expect-error
SensorReporter.mockImplementation(SensorReporterMock);

describe('MultiSensorsReporter', () => {
  let constructorArgument: any;

  beforeEach(() => {
    constructorArgument = [
      {
        name: 'subName',
        type: 'subType'
      },
      {
        name: 'subName2',
        type: 'subType2'
      }
    ];
    startTimeoutMock = jest.fn(() => {});
    mountMock = jest.fn(() => new Promise(() => {}));
    receiveMessageMock = jest.fn(() => new Promise(() => {}));
  });

  afterEach(() => {
    // @ts-expect-error
    SensorReporter.mockImplementation(SensorReporterMock);
  });

  it('Should call subReporter constructor', () => {
    new MultiSensorsReporter(constructorArgument);

    expect(SensorReporterMock).toHaveBeenNthCalledWith(1, constructorArgument[0]);
    expect(SensorReporterMock).toHaveBeenNthCalledWith(2, constructorArgument[1]);
  });

  it('Should call getReport of each', () => {
    getReportMock = jest.fn(() => {
      return {
        type: 'iei',
        valid: false,
        tests: [{ valid: true }]
      };
    });
    const multi = new MultiSensorsReporter(constructorArgument);

    const report = multi.getReport();

    expect(report).toEqual([
      { tests: [{ valid: true }], type: 'iei', valid: false },
      {
        tests: [{ valid: true }],
        type: 'iei',
        valid: false
      }
    ]);
    expect(getReportMock).toHaveBeenCalledTimes(2);
  });

  it('Should call onFinish of each', () => {
    onFinishMock = jest.fn();
    const multi = new MultiSensorsReporter(constructorArgument);

    multi.onFinish();

    expect(onFinishMock).toHaveBeenCalledTimes(2);
  });

  it('Sub timeout before mounted', async () => {
    // @ts-expect-error
    startTimeoutMock = jest.fn((cb: any) => setTimeout(cb, 2000));
    hasFinishedMock = jest.fn(() => true);

    const multi = new MultiSensorsReporter(constructorArgument);

    multi.start();
    const sensorResult = await multi.mount();
    console.log(sensorResult);
  });

  it('Subtimeout before receiving message', async () => {
    receiveMessageMock = jest.fn(() => Promise.resolve());

    const sensors = [{}] as any;
    const multiSensorsReporter = new MultiSensorsReporter(sensors);
    await multiSensorsReporter.receiveMessage();
    expect(receiveMessageMock).toHaveBeenCalledTimes(sensors.length);
  });

  it('Sub mounted', done => {
    mountMock = jest.fn(() => Promise.resolve());
    let timeoutCb = jest.fn();

    const multi = new MultiSensorsReporter(constructorArgument);

    multi.start();
    multi.mount().then(() => {
      expect(startTimeoutMock).toHaveBeenCalled();
      expect(timeoutCb).not.toHaveBeenCalled();
      done();
    });
  });

  it('Handling receiveMessage no sensor', done => {
    const multi = new MultiSensorsReporter([]);

    multi.receiveMessage().then(() => {
      done();
    });
  });

  it('Handling receiveMessage success', done => {
    expect.assertions(0);
    receiveMessageMock = jest.fn(() => Promise.resolve());

    // @ts-expect-error
    new MultiSensorsReporter([{}]).receiveMessage().then(() => {
      done();
    });
  });

  it('Should receiveMessage be success when there is no sensor', done => {
    expect.assertions(0);
    receiveMessageMock = jest.fn(() => Promise.resolve());

    new MultiSensorsReporter([]).receiveMessage().then(() => {
      done();
    });
  });

  it('Handling happy path', done => {
    expect.assertions(0);
    mountMock = jest.fn(() => Promise.resolve());
    receiveMessageMock.mockImplementationOnce(() => Promise.resolve());
    // @ts-expect-error
    const multi = new MultiSensorsReporter([{}]);
    multi
      // @ts-expect-error
      .mount(() => {})
      .then(() => {
        multi.receiveMessage().then(() => {
          done();
        });
      });
  });
});
