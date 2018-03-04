import {EnqueuerStarter} from '../runner/enqueuer-starter';
import { expect } from 'chai';
import 'mocha';
import { UdsReader } from './uds-reader';
import { InputRequisitionFile } from './folder-requisition-reader';

describe('IpcFactory test', function() {
    describe('IpcFactory test', function() {
        it('uds protocol', function() {
            const configurationFile = {
                protocol: "uds"
            }
            const ipcFactory: EnqueuerStarter = new EnqueuerStarter();

            const created = ipcFactory.create();
            expect(created).to.be.instanceOf(UdsReader);
        });

    it('Configuration file', function() {
            const configurationFile = {
            protocol: "uds"
        }
        const commandLine = {
            inputRequisitionFile: "filename"
        }
        const ipcFactory: EnqueuerStarter = new EnqueuerStarter();

        const created = ipcFactory.create();
        expect(created).to.be.instanceOf(InputRequisitionFile);
    });

    it('undefined protocol', function() {
            const configurationFile = {
                protocol: "unknown"
            }
            const ipcFactory: EnqueuerStarter = new EnqueuerStarter();

            expect(() => ipcFactory.create()).to.throw;
        });
    });
});
