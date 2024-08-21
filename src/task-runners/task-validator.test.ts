import { TaskValidator } from './task-validator';

describe('TaskValidator', () => {
  it('Should return error message', () => {
    expect(new TaskValidator().getErrorMessage()).toBe(
      `Unable to find: 'onInit', 'onFinish', 'delay', 'tasks', 'actuators', 'sensors' nor 'import'.`
    );
  });

  it('Should reject empty', () => {
    // @ts-expect-error
    expect(new TaskValidator().validate()).toBeFalsy();
  });

  it('Should accept import', () => {
    // @ts-expect-error
    expect(new TaskValidator().validate({ import: {} })).toBeTruthy();
  });

  it('Should accept onInit', () => {
    // @ts-expect-error
    expect(new TaskValidator().validate({ onInit: {} })).toBeTruthy();
  });

  it('Should accept delay', () => {
    // @ts-expect-error
    expect(new TaskValidator().validate({ delay: {} })).toBeTruthy();
  });

  it('Should accept onFinish', () => {
    // @ts-expect-error
    expect(new TaskValidator().validate({ onFinish: {} })).toBeTruthy();
  });

  it('Should accept actuators', () => {
    // @ts-expect-error
    expect(new TaskValidator().validate({ actuators: [{ type: '' }] })).toBeTruthy();
  });

  it('Should reject empty actuators', () => {
    // @ts-expect-error
    expect(new TaskValidator().validate({ actuators: [] })).toBeFalsy();
  });

  it('Should accept sensors', () => {
    // @ts-expect-error
    expect(new TaskValidator().validate({ sensors: [{ type: '' }] })).toBeTruthy();
  });

  it('Should reject empty sensors', () => {
    // @ts-expect-error
    expect(new TaskValidator().validate({ sensors: [] })).toBeFalsy();
  });

  it('Should go recursive', () => {
    expect(
      new TaskValidator().validate({
        tasks: [
          {
            tasks: [
              // @ts-expect-error
              {
                onInit: {}
              }
            ]
          }
        ]
      })
    ).toBeTruthy();
  });
});
