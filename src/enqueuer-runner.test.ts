import { EnqueuerRunner } from './enqueuer-runner';
import { Configuration } from './configurations/configuration';
import { RequisitionFilePatternParser } from './requisition-runners/requisition-file-pattern-parser';
import { RequisitionRunner } from './requisition-runners/requisition-runner';
import { SummaryTestOutput } from './outputs/summary-test-output';
import { NotificationEmitter } from './notifications/notification-emitter';
import { Logger } from './loggers/logger';
import { LogLevel } from './loggers/log-level';
import { Notifications } from './notifications/notifications';

jest.mock('./outputs/summary-test-output');
jest.mock('./configurations/configuration');
jest.mock('./requisition-runners/requisition-file-pattern-parser');
jest.mock('./requisition-runners/requisition-runner');

jest.mock('./loggers/logger');

const loggerLevel = 'enqueuer-starter-level';

describe('EnqueuerRunner', () => {
  let configurationMethodsMock: any;
  let parsedRequisitions = [{ name: 'I am fake' }];
  let requisitionRunnerMethods = {
    run: jest.fn(async () => {
      const report = {
        name: 'mocked report',
        valid: true,
        hooks: {}
      };
      NotificationEmitter.emit(Notifications.REQUISITION_FINISHED, {
        requisition: report
      });
      return [report];
    })
  };

  let requisitionRunnerMock = jest.fn(() => requisitionRunnerMethods);

  let parallel = true;
  beforeEach(() => {
    configurationMethodsMock = {
      isParallel: jest.fn(() => parallel),
      getOutputs: jest.fn(),
      getFiles: jest.fn(() => ['src/*.ts', 'not-matching-pattern', true]),
      getMaxReportLevelPrint: () => true,
      getShowPassingTests: () => 2,
      getLogLevel: jest.fn(() => loggerLevel)
    };
    // @ts-ignore
    Configuration.getInstance.mockImplementation(() => configurationMethodsMock);

    // @ts-ignore
    RequisitionFilePatternParser.mockImplementationOnce(() => {
      return {
        parse: () => parsedRequisitions,
        getFilesErrors: () => []
      };
    });

    // @ts-ignore
    RequisitionRunner.mockImplementationOnce(requisitionRunnerMock);
    requisitionRunnerMethods.run.mockClear();
    requisitionRunnerMock.mockClear();
  });

  it('Should set logger level', () => {
    const loggerLevelMock = jest.fn();
    // @ts-ignore
    Logger.setLoggerLevel.mockImplementation(loggerLevelMock);

    const runner = new EnqueuerRunner().execute();

    expect(loggerLevelMock).toHaveBeenNthCalledWith(1, LogLevel.INFO);
    expect(loggerLevelMock).toHaveBeenNthCalledWith(2, LogLevel.WARN);
  });

  it('should call configuration methods once', async () => {
    await new EnqueuerRunner().execute();

    expect(configurationMethodsMock.isParallel).toHaveBeenCalledTimes(1);
    expect(configurationMethodsMock.getFiles).toHaveBeenCalledTimes(1);
    expect(configurationMethodsMock.getOutputs).toHaveBeenCalledTimes(1);
    expect(configurationMethodsMock.getLogLevel).toHaveBeenCalledTimes(1);
  });

  it('should call Summary', async () => {
    const printMock = jest.fn();
    // @ts-ignore
    SummaryTestOutput.mockImplementationOnce(() => ({
      print: printMock
    }));

    await new EnqueuerRunner().execute();
    expect(SummaryTestOutput).toHaveBeenCalledWith(
      {
        hooks: {
          onParsed: { tests: [], valid: true }
        },
        name: 'mocked report',
        valid: true
      },
      {
        maxLevel: true,
        showPassingTests: 2,
        printChildren: true
      }
    );
    expect(printMock).toHaveBeenCalledTimes(1);
  });

  it('should log Summary error', () => {
    // @ts-ignore
    SummaryTestOutput.mockImplementationOnce(() => {
      throw 'error';
    });

    expect(async () => await new EnqueuerRunner().execute()).not.toThrowError();
  });
});
