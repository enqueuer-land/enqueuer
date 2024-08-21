import { ChildTaskRunner } from './child-task-runner';
import { TaskRunner } from '../task-runners/task-runner';

jest.mock('../task-runners/task-runner');

const processSendMock = jest.fn();
process.send = processSendMock;

const runMock = jest.fn();
const taskRunnerConstructorMock = jest.fn(() => ({ run: runMock }));
// @ts-ignore
TaskRunner.mockImplementation(taskRunnerConstructorMock);

describe('ChildTaskRunner', () => {
  beforeEach(() => {
    processSendMock.mockClear();
    taskRunnerConstructorMock.mockClear();
    runMock.mockClear();
  });

  it('should run enqueuer runner when a message arrives', async () => {
    const task = 'value';
    const message = { value: 'value' };
    await new ChildTaskRunner().process(message);

    expect(taskRunnerConstructorMock).toHaveBeenCalledWith('value');
    expect(runMock).toHaveBeenCalled();
  });
});
