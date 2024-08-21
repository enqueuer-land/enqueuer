import { ProtocolManager } from './protocol-manager';
import prettyjson from 'prettyjson';
import { NullActuator } from '../actuators/null-actuator';
import { NullSensor } from '../sensors/null-sensor';
import { SensorProtocol } from '../protocols/sensor-protocol';
import { ActuatorProtocol } from '../protocols/actuator-protocol';

jest.mock('prettyjson');

const render = jest.fn();
// @ts-ignore
prettyjson.render.mockImplementation(render);

describe('ProtocolManager', () => {
  beforeEach(() => {
    render.mockClear();
  });

  it('describeMatchingProtocols', () => {
    const protocolManager = new ProtocolManager();
    protocolManager.addProtocol(
      // @ts-ignore
      new ActuatorProtocol('mine', () => {
        /*not empty*/
      })
    );
    expect(protocolManager.describeMatchingProtocols()).toBeTruthy();
    expect(render).toHaveBeenCalledWith(
      {
        actuators: expect.anything(),
        sensors: expect.anything()
      },
      expect.anything()
    );
  });

  it('should create right Actuator', () => {
    const actuator: any = {};
    // @ts-ignore
    const protocolManager = new ProtocolManager();
    protocolManager.addProtocol(
      new ActuatorProtocol('mine', arg => {
        actuator.arg = arg;
        return actuator;
      })
    );
    // @ts-ignore
    const actual = protocolManager.createActuator({ type: 'mine' });
    expect(actual).toEqual({ arg: { type: 'mine' } });
  });

  it('should create right Sensor', () => {
    const sensor: any = {};
    // @ts-ignore
    const protocolManager = new ProtocolManager();
    protocolManager.addProtocol(
      new SensorProtocol('mine', arg => {
        sensor.arg = arg;
        return sensor;
      })
    );
    // @ts-ignore
    const actual = protocolManager.createSensor({ type: 'mine' });
    expect(actual).toEqual({ arg: { type: 'mine' } });
  });

  it('should create NullActuator', () => {
    // @ts-ignore
    const actuator = new ProtocolManager().createActuator({});
    expect(actuator).toBeInstanceOf(NullActuator);
  });

  it('should create NullSensor', () => {
    // @ts-ignore
    const actuator = new ProtocolManager().createSensor({});
    expect(actuator).toBeInstanceOf(NullSensor);
  });

  it('describe given actuator Protocol', () => {
    // @ts-ignore
    const protocolManager = new ProtocolManager();
    protocolManager.addProtocol(
      // @ts-ignore
      new ActuatorProtocol('pub', () => {
        /*not empty*/
      })
        .addAlternativeName('virgs')
        .setLibrary('request')
    );
    expect(protocolManager.describeMatchingProtocols('virgs')).toBeTruthy();
    expect(render).toHaveBeenCalledWith(
      {
        actuators: [
          {
            name: 'pub',
            schema: {
              attributes: {
                type: {
                  description: 'Protocol identifier',
                  required: true,
                  type: 'string'
                },
                ignore: {
                  defaultValue: false,
                  description: 'Defines if the component should be ignored',
                  required: false,
                  type: 'boolean'
                },
                name: {
                  description: 'Defines the component name',
                  required: false,
                  type: 'string'
                }
              },
              hooks: {
                onFinish: {
                  arguments: {
                    elapsedTime: {
                      description: 'Number of milliseconds since the instantiation of the component'
                    },
                    this: { description: 'Pointer to the component' }
                  },
                  description: 'Executed when the component is about to finish'
                },
                onInit: {
                  arguments: {
                    elapsedTime: {
                      description: 'Number of milliseconds since the instantiation of the component'
                    },
                    this: { description: 'Pointer to the component' }
                  },
                  description: 'Executed as soon as the component is initialized'
                }
              }
            }
          }
        ],
        sensors: []
      },
      expect.anything()
    );
  });

  it('describe given actuator Protocol not string param', () => {
    // @ts-ignore
    const protocolManager = new ProtocolManager();
    protocolManager.addProtocol(
      // @ts-ignore
      new ActuatorProtocol('pub', () => {
        /*not empty*/
      })
    );
    protocolManager.addProtocol(
      // @ts-ignore
      new ActuatorProtocol('other', () => {
        /*not empty*/
      })
    );
    expect(protocolManager.describeMatchingProtocols()).toBeTruthy();
    expect(render).toHaveBeenCalledWith(
      {
        actuators: [
          {
            name: 'pub',
            schema: {
              attributes: {
                type: {
                  description: 'Protocol identifier',
                  required: true,
                  type: 'string'
                },
                ignore: {
                  defaultValue: false,
                  description: 'Defines if the component should be ignored',
                  required: false,
                  type: 'boolean'
                },
                name: {
                  description: 'Defines the component name',
                  required: false,
                  type: 'string'
                }
              },
              hooks: {
                onFinish: {
                  arguments: {
                    elapsedTime: {
                      description: 'Number of milliseconds since the instantiation of the component'
                    },
                    this: { description: 'Pointer to the component' }
                  },
                  description: 'Executed when the component is about to finish'
                },
                onInit: {
                  arguments: {
                    elapsedTime: {
                      description: 'Number of milliseconds since the instantiation of the component'
                    },
                    this: { description: 'Pointer to the component' }
                  },
                  description: 'Executed as soon as the component is initialized'
                }
              }
            }
          },
          {
            name: 'other',
            schema: {
              attributes: {
                type: {
                  description: 'Protocol identifier',
                  required: true,
                  type: 'string'
                },
                ignore: {
                  defaultValue: false,
                  description: 'Defines if the component should be ignored',
                  required: false,
                  type: 'boolean'
                },
                name: {
                  description: 'Defines the component name',
                  required: false,
                  type: 'string'
                }
              },
              hooks: {
                onFinish: {
                  arguments: {
                    elapsedTime: {
                      description: 'Number of milliseconds since the instantiation of the component'
                    },
                    this: { description: 'Pointer to the component' }
                  },
                  description: 'Executed when the component is about to finish'
                },
                onInit: {
                  arguments: {
                    elapsedTime: {
                      description: 'Number of milliseconds since the instantiation of the component'
                    },
                    this: { description: 'Pointer to the component' }
                  },
                  description: 'Executed as soon as the component is initialized'
                }
              }
            }
          }
        ],
        sensors: []
      },
      expect.anything()
    );
  });

  it('error describing Protocol', () => {
    // @ts-ignore
    const protocolManager = new ProtocolManager();
    expect(protocolManager.describeMatchingProtocols()).toBeFalsy();
    expect(render).toHaveBeenCalled();
  });

  it('describe given sensor Protocol', () => {
    // @ts-ignore
    const protocolManager = new ProtocolManager();
    protocolManager.addProtocol(
      new SensorProtocol(
        'sub',
        // @ts-ignore
        () => {
          /*not empty*/
        },
        ['value']
      )
        .addAlternativeName('altName')
        .setLibrary('express')
    );
    expect(protocolManager.describeMatchingProtocols('sub')).toBeTruthy();
    expect(render).toHaveBeenCalledWith(
      {
        actuators: [],
        sensors: [
          {
            '0': 'value',
            name: 'sub',
            schema: {
              attributes: {
                type: {
                  description: 'Protocol identifier',
                  required: true,
                  type: 'string'
                },

                avoid: {
                  defaultValue: false,
                  description: 'Defines if the sensor should be avoided',
                  required: false,
                  type: 'boolean'
                },
                ignore: {
                  defaultValue: false,
                  description: 'Defines if the component should be ignored',
                  required: false,
                  type: 'boolean'
                },
                name: {
                  description: 'Defines the component name',
                  required: false,
                  type: 'string'
                },
                timeout: {
                  defaultValue: 3000,
                  description: 'Defines the sensor time out',
                  required: false,
                  suffix: 'ms',
                  type: 'int'
                }
              },
              hooks: {
                onFinish: {
                  arguments: {
                    elapsedTime: {
                      description: 'Number of milliseconds since the instantiation of the component'
                    },
                    this: { description: 'Pointer to the component' }
                  },
                  description: 'Executed when the component is about to finish'
                },
                onInit: {
                  arguments: {
                    elapsedTime: {
                      description: 'Number of milliseconds since the instantiation of the component'
                    },
                    this: { description: 'Pointer to the component' }
                  },
                  description: 'Executed as soon as the component is initialized'
                }
              }
            }
          }
        ]
      },
      expect.anything()
    );
  });

  it('describe given sensor Protocol not string param', () => {
    // @ts-ignore
    const protocolManager = new ProtocolManager();
    protocolManager.addProtocol(
      // @ts-ignore
      new SensorProtocol('sub', () => {
        /*not empty*/
      })
    );
    protocolManager.addProtocol(
      // @ts-ignore
      new SensorProtocol('sub2', () => {
        /*not empty*/
      })
    );
    expect(protocolManager.describeMatchingProtocols()).toBeTruthy();
    expect(render).toHaveBeenCalledWith(
      {
        actuators: [],
        sensors: [
          {
            name: 'sub',
            schema: {
              attributes: {
                type: {
                  description: 'Protocol identifier',
                  required: true,
                  type: 'string'
                },

                avoid: {
                  defaultValue: false,
                  description: 'Defines if the sensor should be avoided',
                  required: false,
                  type: 'boolean'
                },
                ignore: {
                  defaultValue: false,
                  description: 'Defines if the component should be ignored',
                  required: false,
                  type: 'boolean'
                },
                name: {
                  description: 'Defines the component name',
                  required: false,
                  type: 'string'
                },
                timeout: {
                  defaultValue: 3000,
                  description: 'Defines the sensor time out',
                  required: false,
                  suffix: 'ms',
                  type: 'int'
                }
              },
              hooks: {
                onFinish: {
                  arguments: {
                    elapsedTime: {
                      description: 'Number of milliseconds since the instantiation of the component'
                    },
                    this: { description: 'Pointer to the component' }
                  },
                  description: 'Executed when the component is about to finish'
                },
                onInit: {
                  arguments: {
                    elapsedTime: {
                      description: 'Number of milliseconds since the instantiation of the component'
                    },
                    this: { description: 'Pointer to the component' }
                  },
                  description: 'Executed as soon as the component is initialized'
                }
              }
            }
          },
          {
            name: 'sub2',
            schema: {
              attributes: {
                type: {
                  description: 'Protocol identifier',
                  required: true,
                  type: 'string'
                },

                avoid: {
                  defaultValue: false,
                  description: 'Defines if the sensor should be avoided',
                  required: false,
                  type: 'boolean'
                },
                ignore: {
                  defaultValue: false,
                  description: 'Defines if the component should be ignored',
                  required: false,
                  type: 'boolean'
                },
                name: {
                  description: 'Defines the component name',
                  required: false,
                  type: 'string'
                },
                timeout: {
                  defaultValue: 3000,
                  description: 'Defines the sensor time out',
                  required: false,
                  suffix: 'ms',
                  type: 'int'
                }
              },
              hooks: {
                onFinish: {
                  arguments: {
                    elapsedTime: {
                      description: 'Number of milliseconds since the instantiation of the component'
                    },
                    this: { description: 'Pointer to the component' }
                  },
                  description: 'Executed when the component is about to finish'
                },
                onInit: {
                  arguments: {
                    elapsedTime: {
                      description: 'Number of milliseconds since the instantiation of the component'
                    },
                    this: { description: 'Pointer to the component' }
                  },
                  description: 'Executed as soon as the component is initialized'
                }
              }
            }
          }
        ]
      },
      expect.anything()
    );
  });
});
