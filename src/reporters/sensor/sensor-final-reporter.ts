import { TestModel } from '../../models/outputs/test-model';

export type Time = { timeout?: number; totalTime: number };
export type Summary = {
  mounted: boolean;
  avoidable: boolean;
  messageReceived?: any;
  time?: Time;
  ignore?: boolean;
  mountError?: string;
};

export class SensorFinalReporter {
  private messageReceivedTestName: string = `Message received`;
  private sensorAvoidedTestName: string = `Sensor avoided`;
  private noTimeOutTestName: string = `No time out`;
  private mountedTestName: string = `Prepared`;

  private readonly mounted: boolean;
  private readonly avoidable: boolean;
  private readonly messageReceived?: any = false;
  private readonly ignore: boolean;
  private readonly time?: Time;
  private readonly mountError?: string;

  constructor(summary: Summary) {
    this.mounted = summary.mounted;
    this.avoidable = summary.avoidable;
    this.messageReceived = summary.messageReceived;
    this.time = summary.time;
    this.mountError = summary.mountError;
    this.ignore = !!summary.ignore;
  }

  public getReport(): TestModel[] {
    if (this.ignore) {
      return [];
    }
    if (!this.mounted) {
      return this.createNotPreparedTests();
    }
    let tests: TestModel[] = [];
    if (this.avoidable) {
      tests = tests.concat(this.createAvoidableTests());
    } else {
      tests = tests.concat(this.createMessageTests());
    }
    return tests.concat(this.addTimeoutTests());
  }

  private addTimeoutTests(): TestModel[] {
    if (this.time) {
      if (!!this.time.timeout && this.time.totalTime > this.time.timeout) {
        return this.createTimeoutTests();
      }
    }
    return [];
  }

  private createNotPreparedTests(): TestModel[] {
    return [
      {
        implicit: true,
        valid: false,
        name: this.mountedTestName,
        description: this.mountError || 'Sensor failed to mount'
      }
    ];
  }

  private createMessageTests(): TestModel[] {
    if (this.messageReceived) {
      return [
        {
          implicit: true,
          valid: true,
          name: this.messageReceivedTestName,
          description: this.messageReceived
        }
      ];
    } else {
      return [
        {
          implicit: true,
          valid: false,
          name: this.messageReceivedTestName,
          description: `Sensor has not received its message`
        }
      ];
    }
  }

  private createTimeoutTests(): TestModel[] {
    if (!this.avoidable && this.time) {
      return [
        {
          implicit: true,
          valid: false,
          name: this.noTimeOutTestName,
          description: `Not avoidable sensor has timed out: ${this.time.totalTime} > ${this.time.timeout}`
        }
      ];
    }
    return [];
  }

  private createAvoidableTests(): TestModel[] {
    if (this.messageReceived) {
      return [
        {
          implicit: true,
          valid: false,
          name: this.sensorAvoidedTestName,
          description: `Avoidable sensor should not receive messages`
        }
      ];
    } else {
      return [
        {
          valid: true,
          implicit: true,
          name: this.sensorAvoidedTestName,
          description: `Avoidable sensor has not received any message`
        }
      ];
    }
  }
}
