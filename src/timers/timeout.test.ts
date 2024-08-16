import { Timeout } from './timeout';
import { DateController } from './date-controller';

jest.useFakeTimers();

describe('Timeout', function () {
  test('should call callback after given time', done => {
    const startTime = new DateController().getTime();
    const toleranceInMilliseconds = 100;
    const period: number = 2;

    let timeoutCallback = jest.fn(() => {
      const callbackCalledTime = new DateController().getTime();

      expect(callbackCalledTime - startTime).toBeLessThan(toleranceInMilliseconds + period);
      done();
    });

    const timeout: Timeout = new Timeout(timeoutCallback);

    expect(timeoutCallback).not.toBeCalled();

    timeout.start(period);

    // Fast-forward until all timers have been executed
    jest.runAllTimers();

    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), period);
  });

  test('should not call callback if clean in time', () => {
    const period: number = 2;

    let timeoutCallback = jest.fn();
    const timeout: Timeout = new Timeout(timeoutCallback);

    expect(timeoutCallback).not.toBeCalled();

    timeout.start(period);
    timeout.clear();

    // Fast-forward until all timers have been executed
    jest.runAllTimers();

    expect(timeoutCallback).not.toBeCalled();
  });

  test("should not clear timeout if it's not started", () => {
    let timeoutCallback = jest.fn();
    const timeout: Timeout = new Timeout(timeoutCallback);

    expect(timeoutCallback).not.toBeCalled();

    timeout.clear();

    // Fast-forward until all timers have been executed
    jest.runAllTimers();

    expect(timeoutCallback).not.toBeCalled();
  });
});
