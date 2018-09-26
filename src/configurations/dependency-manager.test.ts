import {DependencyManager} from "./dependency-manager";
import {exec} from 'child_process';
const packageJson = require('../../package.json');
jest.mock('../../package.json');
jest.mock('child_process');

packageJson.optionalDependencies = {amqp: '1', express: '1'};
packageJson.dependencies = {express: '1'};

describe('DependencyManager', () => {

    it('listAvailable', () => {
        const notInstalled = new DependencyManager().listAvailable();
        expect(notInstalled.length).toBe(2);
        expect(notInstalled[0]).toContain('amqp');
        expect(notInstalled[1]).toContain('express');
    });

    it('Try to install - success', done => {
        const execMock = jest.fn((command, cb) => cb());
        exec.mockImplementation(execMock);
        new DependencyManager().tryToInstall(['amqp']).then(() => {
            expect(execMock).toHaveBeenCalledWith("npm install amqp@1", expect.any(Function));
            done();
        });
    });

    it('Try to install - error', done => {
        const execMock = jest.fn((command, cb) => cb('error'));
        exec.mockImplementation(execMock);
        new DependencyManager().tryToInstall(['amqp']).catch((err) => {
            expect(execMock).toHaveBeenCalledWith("npm install amqp@1", expect.any(Function));
            expect(err).toBe('error');
            done();
        });
    });

});