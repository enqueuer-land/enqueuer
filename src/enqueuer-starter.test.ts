import { EnqueuerStarter } from './enqueuer-starter';
import { EnqueuerRunner } from './enqueuer-runner';

jest.mock('./enqueuer-runner');
jest.mock('./configurations/configuration');

describe('EnqueuerStarter', () => {
  it('Should translate true to 0', async () => {
    // @ts-ignore
    EnqueuerRunner.mockImplementationOnce(() => ({ execute: () => [] }));

    expect(await new EnqueuerStarter().start()).toBe(0);
  });

  it('Should translate false to 1', async () => {
    // @ts-ignore
    EnqueuerRunner.mockImplementationOnce(() => ({
      execute: () => [{ valid: false }]
    }));

    expect(await new EnqueuerStarter().start()).toBe(1);
  });

  it('Should translate error to -1', async () => {
    // @ts-ignore
    EnqueuerRunner.mockImplementationOnce(() => {
      return {
        execute: () => {
          throw `error`;
        }
      };
    });

    expect(await new EnqueuerStarter().start()).toBe(-1);
  });
});
