import { Event } from '../models/events/event';
import { Assertion } from '../models/events/assertion';
import { Logger } from '../loggers/logger';
import { TestModel } from '../models/outputs/test-model';
import { EventCodeGenerator } from '../code-generators/event-code-generator';

export class EventExecutor {
  private arguments: { name: string; value: any }[] = [];
  private readonly thisArg: any;
  private readonly event: Event;
  private readonly eventName: string;
  private readonly componentName?: string;

  public constructor(thisArg: any, eventName: string, componentName?: string) {
    this.componentName = componentName;
    this.thisArg = thisArg;
    this.eventName = eventName;
    this.event = this.initializeEvent(this.thisArg[eventName]);
    this.componentName = componentName;
    if (componentName) {
      this.addArgument(componentName, thisArg);
    }
  }

  public isDebugMode(): boolean {
    return !!this.event.debug;
  }

  public addArgument(name: string, value: any): void {
    this.arguments.push({ name: name, value: value });
  }

  public execute(): TestModel[] {
    Logger.debug(`Executing ${this.componentName ?? 'component'}'s '${this.eventName}' hook`);
    Logger.trace(`'${this.eventName}': ${JSON.stringify(this.event)}`);
    this.arguments.unshift({
      name: 'argumentNames',
      value: this.arguments.map(item => item.name)
    });
    return new EventCodeGenerator(this.thisArg, this.eventName).run(this.arguments);
  }

  private initializeEvent(event: Event): Event {
    let result: Event = {
      debug: false,
      script: '',
      store: {},
      assertions: []
    };
    if (event) {
      result = {
        debug: !!event.debug,
        script: event.script || '',
        store: event.store || {},
        assertions: this.baptizeAssertions(event.assertions || [])
      };
    }
    return result;
  }

  private baptizeAssertions(assertions: Assertion[]): Assertion[] {
    return assertions.map((assertion, index) => {
      if (!assertion.name) {
        assertion.name = `Assertion #${index}`;
      }
      return assertion;
    });
  }
}
