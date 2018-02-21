import {IpcCommunicatorFactory} from './ipc-communicator-factory';
import { expect } from 'chai';
import 'mocha';
import { IpcUds } from './ipc-uds';
import { InputRequisitionFile } from './input-requisition-file';

describe('IpcFactory test', function() {
    describe('IpcFactory test', function() {
        it('uds protocol', function() {
            const configurationFile = {
                protocol: "uds"
            }
            const ipcFactory: IpcCommunicatorFactory = new IpcCommunicatorFactory();

            const created = ipcFactory.create();
            expect(created).to.be.instanceOf(IpcUds);
        });

    it('Configuration file', function() {
            const configurationFile = {
            protocol: "uds"
        }
        const commandLine = {
            inputRequisitionFile: "filename"
        }
        const ipcFactory: IpcCommunicatorFactory = new IpcCommunicatorFactory();

        const created = ipcFactory.create();
        expect(created).to.be.instanceOf(InputRequisitionFile);
    });

    it('undefined protocol', function() {
            const configurationFile = {
                protocol: "unknown"
            }
            const ipcFactory: IpcCommunicatorFactory = new IpcCommunicatorFactory();

            expect(() => ipcFactory.create()).to.throw;
        });
    });
});
