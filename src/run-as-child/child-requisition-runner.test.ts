import {ChildRequisitionRunner} from './child-requisition-runner';
import {RequisitionRunner} from '../requisition-runners/requisition-runner';

jest.mock('../requisition-runners/requisition-runner');

const processSendMock = jest.fn();
process.send = processSendMock;

const runMock = jest.fn();
const requisitionRunnerConstructorMock = jest.fn(() => ({run: runMock}));
// @ts-ignore
RequisitionRunner.mockImplementation(requisitionRunnerConstructorMock);

describe('ChildRequisitionRunner', () => {
    beforeEach(() => {
        processSendMock.mockClear();
        requisitionRunnerConstructorMock.mockClear();
        runMock.mockClear();
    });

    it('should run enqueuer runner when a message arrives', async () => {
        const requisition = 'value';
        const message = {value: 'value'};
        await new ChildRequisitionRunner().process(message);

        expect(requisitionRunnerConstructorMock).toHaveBeenCalledWith('value');
        expect(runMock).toHaveBeenCalled();
    });


});
