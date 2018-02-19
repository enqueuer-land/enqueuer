import {IpcFactory} from './ipc-factory';
import { expect } from 'chai';
import 'mocha';
import { IpcMqtt } from './ipc-mqtt';
import { IpcUdp } from './ipc-udp';

describe('IpcFactory test', function() {
    describe('IpcFactory test', function() {
        it('mqtt protocol', function() {
            const ipcFactory: IpcFactory = new IpcFactory();
            const configurationFile = {
                protocol: "mqtt"
            }

            const created = ipcFactory.create(configurationFile);
            expect(created).to.be.instanceOf(IpcMqtt);
        });

        it('udp protocol', function() {
            const ipcFactory: IpcFactory = new IpcFactory();
            const configurationFile = {
                protocol: "udp"
            }

            const created = ipcFactory.create(configurationFile);
            expect(created).to.be.instanceOf(IpcUdp);
        });

        it('undefined protocol', function() {
            const ipcFactory: IpcFactory = new IpcFactory();
            const configurationFile = {
                protocol: "unknown"
            }

            expect(() => ipcFactory.create(configurationFile)).to.throw;
        });
    });
});
