import { Logger } from '../loggers/logger';
import { DefaultHookEvents } from '../models/events/event';
import { ProtocolDocumentation } from './protocol-documentation';
import { SensorReporter } from '../reporters/sensor/sensor-reporter';

type Library = {
  name: string;
  installed: boolean;
};

export enum ProtocolType {
  PUBLISHER,
  SUBSCRIPTION
}

export abstract class Protocol {
  private readonly type: ProtocolType;
  private readonly name: string;
  private readonly documentation: ProtocolDocumentation;
  private alternativeNames?: string[];
  private library?: Library;

  protected constructor(name: string, type: ProtocolType, protocolDocumentation?: ProtocolDocumentation) {
    this.name = name;
    this.type = type;
    this.documentation = this.createDefaultDocumentation();
    if (protocolDocumentation) {
      this.documentation = protocolDocumentation;
    }
    this.addDefaultValues(type);
  }

  private addDefaultValues(type: ProtocolType) {
    if (!this.documentation.schema) {
      this.documentation.schema = {};
    }
    if (!this.documentation.schema.hooks) {
      this.documentation.schema.hooks = {};
    }
    this.documentation.schema.hooks = Object.assign({}, this.documentation.schema.hooks, {
      [DefaultHookEvents.ON_INIT]: {
        arguments: {},
        description: 'Executed as soon as the component is initialized'
      },
      [DefaultHookEvents.ON_FINISH]: {
        arguments: {},
        description: 'Executed when the component is about to finish'
      }
    });
    Object.keys(this.documentation.schema.hooks).forEach((key: string) => {
      const hookArguments = this.documentation.schema!.hooks![key].arguments;
      this.documentation.schema!.hooks![key].arguments = {
        ...hookArguments,
        elapsedTime: {
          description: 'Number of milliseconds since the instantiation of the component'
        },
        this: {
          description: 'Pointer to the component'
        }
      };
    });
    if (!this.documentation.schema.attributes) {
      this.documentation.schema.attributes = {};
    }
    this.documentation.schema.attributes.ignore = {
      type: 'boolean',
      required: false,
      defaultValue: false,
      description: 'Defines if the component should be ignored'
    };
    this.documentation.schema.attributes.name = {
      type: 'string',
      required: false,
      description: 'Defines the component name'
    };
    this.documentation.schema.attributes.type = {
      type: 'string',
      required: true,
      description: 'Protocol identifier'
    };
    if (type == ProtocolType.SUBSCRIPTION) {
      this.documentation.schema.attributes.timeout = {
        type: 'int',
        suffix: 'ms',
        required: false,
        defaultValue: SensorReporter.DEFAULT_TIMEOUT,
        description: 'Defines the sensor time out'
      };
      this.documentation.schema.attributes.avoid = {
        type: 'boolean',
        required: false,
        defaultValue: false,
        description: 'Defines if the sensor should be avoided'
      };
    }
  }

  private createDefaultDocumentation() {
    return {
      schema: {
        attributes: {},
        hooks: {
          [DefaultHookEvents.ON_INIT]: {
            arguments: {}
          },
          [DefaultHookEvents.ON_FINISH]: {
            arguments: {}
          }
        }
      }
    };
  }

  public isSensor(): boolean {
    return this.type === ProtocolType.SUBSCRIPTION;
  }

  public isActuator(): boolean {
    return this.type === ProtocolType.PUBLISHER;
  }

  public getName(): string {
    return this.name;
  }

  public getDescription(): {} {
    if (Object.keys(this.documentation).length > 0) {
      return { ...this.documentation, name: this.name };
    }
    return { name: this.name };
  }

  public addAlternativeName(...alternativeNames: string[]): Protocol {
    let uniqueAlternativeNames;
    if (this.alternativeNames) {
      uniqueAlternativeNames = new Set(this.alternativeNames.concat(alternativeNames));
    } else {
      uniqueAlternativeNames = new Set(alternativeNames);
    }
    this.alternativeNames = Array.from(uniqueAlternativeNames);
    return this;
  }

  public setLibrary(libraryName: string): Protocol {
    this.library = this.createLibrary(libraryName);
    return this;
  }

  public matches(type: string): boolean {
    if (typeof type === 'string') {
      try {
        return [this.name]
          .concat(this.alternativeNames || [])
          .some((name: string) => name.toUpperCase().includes(type.toUpperCase()));
      } catch (exc) {
        Logger.warning(`Error comparing protocols with given type '${type}': ${exc}`);
      }
    }
    return false;
  }

  private isLibraryInstalled(libraryName: string): boolean {
    try {
      require.resolve(libraryName);
      return true;
    } catch (e) {
      /* do nothing */
    }
    return false;
  }

  private createLibrary(name: string): Library | undefined {
    return {
      name: name,
      installed: this.isLibraryInstalled(name)
    };
  }
}
