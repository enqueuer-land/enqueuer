import { ProtocolManager } from './protocol-manager';
import prettyjson from 'prettyjson';
import { NullPublisher } from '../publishers/null-publisher';
import { NullSubscription } from '../subscriptions/null-subscription';
import { SubscriptionProtocol } from '../protocols/subscription-protocol';
import { PublisherProtocol } from '../protocols/publisher-protocol';

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
      new PublisherProtocol('mine', () => {
        /*not empty*/
      })
    );
    expect(protocolManager.describeMatchingProtocols()).toBeTruthy();
    expect(render).toHaveBeenCalledWith(
      {
        publishers: expect.anything(),
        subscriptions: expect.anything()
      },
      expect.anything()
    );
  });

  it('should create right Publisher', () => {
    const publisher: any = {};
    // @ts-ignore
    const protocolManager = new ProtocolManager();
    protocolManager.addProtocol(
      new PublisherProtocol('mine', arg => {
        publisher.arg = arg;
        return publisher;
      })
    );
    // @ts-ignore
    const actual = protocolManager.createPublisher({ type: 'mine' });
    expect(actual).toEqual({ arg: { type: 'mine' } });
  });

  it('should create right Subscription', () => {
    const subscription: any = {};
    // @ts-ignore
    const protocolManager = new ProtocolManager();
    protocolManager.addProtocol(
      new SubscriptionProtocol('mine', arg => {
        subscription.arg = arg;
        return subscription;
      })
    );
    // @ts-ignore
    const actual = protocolManager.createSubscription({ type: 'mine' });
    expect(actual).toEqual({ arg: { type: 'mine' } });
  });

  it('should create NullPublisher', () => {
    // @ts-ignore
    const publisher = new ProtocolManager().createPublisher({});
    expect(publisher).toBeInstanceOf(NullPublisher);
  });

  it('should create NullSubscription', () => {
    // @ts-ignore
    const publisher = new ProtocolManager().createSubscription({});
    expect(publisher).toBeInstanceOf(NullSubscription);
  });

  it('describe given publisher Protocol', () => {
    // @ts-ignore
    const protocolManager = new ProtocolManager();
    protocolManager.addProtocol(
      // @ts-ignore
      new PublisherProtocol('pub', () => {
        /*not empty*/
      })
        .addAlternativeName('virgs')
        .setLibrary('request')
    );
    expect(protocolManager.describeMatchingProtocols('virgs')).toBeTruthy();
    expect(render).toHaveBeenCalledWith(
      {
        publishers: [
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
        subscriptions: []
      },
      expect.anything()
    );
  });

  it('describe given publisher Protocol not string param', () => {
    // @ts-ignore
    const protocolManager = new ProtocolManager();
    protocolManager.addProtocol(
      // @ts-ignore
      new PublisherProtocol('pub', () => {
        /*not empty*/
      })
    );
    protocolManager.addProtocol(
      // @ts-ignore
      new PublisherProtocol('other', () => {
        /*not empty*/
      })
    );
    expect(protocolManager.describeMatchingProtocols()).toBeTruthy();
    expect(render).toHaveBeenCalledWith(
      {
        publishers: [
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
        subscriptions: []
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

  it('describe given subscription Protocol', () => {
    // @ts-ignore
    const protocolManager = new ProtocolManager();
    protocolManager.addProtocol(
      new SubscriptionProtocol(
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
        publishers: [],
        subscriptions: [
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
                  description: 'Defines if the subscription should be avoided',
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
                  description: 'Defines the subscription time out',
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

  it('describe given subscription Protocol not string param', () => {
    // @ts-ignore
    const protocolManager = new ProtocolManager();
    protocolManager.addProtocol(
      // @ts-ignore
      new SubscriptionProtocol('sub', () => {
        /*not empty*/
      })
    );
    protocolManager.addProtocol(
      // @ts-ignore
      new SubscriptionProtocol('sub2', () => {
        /*not empty*/
      })
    );
    expect(protocolManager.describeMatchingProtocols()).toBeTruthy();
    expect(render).toHaveBeenCalledWith(
      {
        publishers: [],
        subscriptions: [
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
                  description: 'Defines if the subscription should be avoided',
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
                  description: 'Defines the subscription time out',
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
                  description: 'Defines if the subscription should be avoided',
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
                  description: 'Defines the subscription time out',
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
