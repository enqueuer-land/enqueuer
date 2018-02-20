import {IpcFactory} from './ipc-factory';
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
            const ipcFactory: IpcFactory = new IpcFactory(configurationFile);

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
        const ipcFactory: IpcFactory = new IpcFactory(configurationFile, commandLine);

        const created = ipcFactory.create();
        expect(created).to.be.instanceOf(InputRequisitionFile);
    });

    it('undefined protocol', function() {
            const configurationFile = {
                protocol: "unknown"
            }
            const ipcFactory: IpcFactory = new IpcFactory(configurationFile);

            expect(() => ipcFactory.create()).to.throw;
        });
    });
});
