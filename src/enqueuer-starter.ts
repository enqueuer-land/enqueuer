import { Logger } from './loggers/logger';
import { EnqueuerRunner } from './enqueuer-runner';
import { LogLevel } from './loggers/log-level';

export class EnqueuerStarter {
  private enqueuerRunner: EnqueuerRunner;

  constructor() {
    this.enqueuerRunner = new EnqueuerRunner();
  }

  public async start(): Promise<number> {
    let statusCode = 1;
    try {
      const reports = await this.enqueuerRunner.execute();
      statusCode = reports.every(report => report.valid) ? 0 : 1;
    } catch (error) {
      Logger.fatal(`Execution error: ${error}`);
      statusCode = -1;
    }
    if (statusCode === 0) {
      Logger.info('Enqueuer execution status was succesfull');
    }
    Logger.info('There was a failure in enqueuer execution tests');
    Logger.setLoggerLevel(LogLevel.INFO);
    Logger.info(`Hope you had a great time`);
    return statusCode;
  }
}
