import { ActuatorReporter } from './actuator-reporter';
import { ProtocolManager } from '../../plugins/protocol-manager';
import { DynamicModulesManager } from '../../plugins/dynamic-modules-manager';
import { EventExecutor } from '../../events/event-executor';
import { DefaultHookEvents } from '../../models/events/event';

jest.mock('../../plugins/dynamic-modules-manager');
// @ts-ignore
DynamicModulesManager.getInstance.mockImplementation(() => {
  return {
    getProtocolManager: () => new ProtocolManager()
  };
});

let actMock = jest.fn(() => Promise.resolve('publishResult')) as any;
let actuatorMock = jest.fn(() => {
  return {
    act: actMock,
    registerHookEventExecutor: () => ({})
  };
});

jest.mock('../../plugins/protocol-manager');
// @ts-ignore
ProtocolManager.mockImplementation(() => {
  return {
    createActuator: actuatorMock
  };
});

jest.mock('../../events/event-executor');
// @ts-expect-error
EventExecutor.mockImplementation(() => ({
  execute: () => [],
  isDebugMode: () => [],
  addArgument: () => {}
}));

const actuator = {
  name: 'pubName',
  id: 'id',
  type: 'type'
} as any;

describe('ActuatorReporter', () => {
  beforeEach(() => {
    actMock = jest.fn(() => Promise.resolve(true));
  });

  it('Should call actuator constructor', () => {
    new ActuatorReporter(actuator);

    expect(actuatorMock).toHaveBeenCalledWith(actuator);
  });

  it('Should call onInit', () => {
    // @ts-expect-error
    EventExecutor.mockImplementation = jest.fn();

    new ActuatorReporter(actuator);

    expect(EventExecutor).toHaveBeenCalledWith(actuator, 'onInit', 'actuator');
  });

  it('Should resolve onMessageReceived', done => {
    const actuatorReporter = new ActuatorReporter(actuator);
    actuatorReporter.act().then(() => {
      done();
    });
  });

  it('Should reject onMessageReceived', done => {
    const reason = 'reasonMessage';
    actMock = jest.fn(() => Promise.reject(reason));
    const actuatorReporter = new ActuatorReporter(actuator);
    actuatorReporter.act().catch(err => {
      expect(err).toBe(reason);

      done();
    });
  });

  it('Should keep id', done => {
    const actuatorReporter = new ActuatorReporter(actuator as any);
    actuatorReporter.act().then(() => {
      const report = actuatorReporter.getReport();
      expect(report.id).toBe(actuator.id);
      done();
    });
  });

  it('Should add Actuator test - success', done => {
    const actuatorReporter = new ActuatorReporter(actuator as any);
    actuatorReporter.act().then(() => {
      actuatorReporter.onFinish();
      const report = actuatorReporter.getReport();
      expect(report.name).toBe(actuator.name);
      const actuatorTest = report.hooks![DefaultHookEvents.ON_FINISH].tests[0];
      expect(actuatorTest.name).toBe('Acted');
      expect(actuatorTest.valid).toBeTruthy();

      done();
    });
  });

  it('Should add Actuator test - fail', done => {
    const reason = 'reasonMessage';
    actMock = jest.fn(() => Promise.reject(reason));
    const actuatorReporter = new ActuatorReporter(actuator as any);
    actuatorReporter.act().catch(() => {
      actuatorReporter.onFinish();
      const report = actuatorReporter.getReport();
      expect(report.name).toBe(actuator.name);
      const actuatorTest = report.hooks![DefaultHookEvents.ON_FINISH].tests[0];
      expect(actuatorTest.name).toBe('Acted');
      expect(actuatorTest.valid).toBeFalsy();

      done();
    });
  });

  it('Should call onFinish', async () => {
    // @ts-expect-error
    EventExecutor.mockClear();
    // @ts-expect-error
    EventExecutor.mockImplementation = jest.fn();

    await new ActuatorReporter(actuator).onFinish();

    expect(EventExecutor).toHaveBeenNthCalledWith(
      2,
      {
        act: expect.any(Function),
        registerHookEventExecutor: expect.any(Function)
      },
      'onFinish',
      'actuator'
    );
  });
});
