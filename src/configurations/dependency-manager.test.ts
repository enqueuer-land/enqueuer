import {DependencyManager} from "./dependency-manager";
const packageJson = require('../../package.json');
jest.mock('../../package.json');
jest.mock('child_process');

packageJson.optionalDependencies = {amqp: '1', express: '2.0.0'};

describe('DependencyManager', () => {

    it('listAvailable', () => {
        const notInstalled = new DependencyManager().listAvailable();
        expect(notInstalled.length).toBe(2);
        expect(notInstalled[0]).toBe('amqp@1');
        expect(notInstalled[1]).toBe('express@2.0.0');
    });

});