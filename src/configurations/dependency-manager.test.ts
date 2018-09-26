import {DependencyManager} from "./dependency-manager";
import {Dependency} from "./dependency";
import {exec} from 'child_process';
const packageJson = require('../../package.json');
jest.mock('../../package.json');
jest.mock('child_process');

packageJson.devDependencies = {amqp: '1', express: '1'};
packageJson.dependencies = {express: '1'};

describe('DependencyManager', () => {

    it('list not installed', () => {
        const notInstalled = new DependencyManager().listNotInstalled();
        expect(notInstalled.length).toBe(1);
        expect(packageJson.devDependencies[notInstalled[0].getPackage()]).toBeDefined();
        expect(notInstalled[0].getVersion()).toBe(packageJson.devDependencies[notInstalled[0].getPackage()]);
    });

    it('listAvailable', () => {
        const notInstalled = new DependencyManager().listAvailable();
        expect(notInstalled.length).toBe(2);
        expect(notInstalled[0]).toContain('amqp');
        expect(notInstalled[1]).toContain('express');
    });


    it('Try to install - installed', done => {
        const execMock = jest.fn(() => true);
        exec.mockImplementation(execMock);
        new DependencyManager().tryToInstall(['express']).then(() => {
            expect(execMock).not.toHaveBeenCalled();
            done();
        });
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