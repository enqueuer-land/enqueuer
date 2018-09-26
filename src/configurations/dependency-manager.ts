import {Dependency} from './dependency';
const packageJson = require('../../package.json');

export class DependencyManager {

    private readonly protocols: string[] = ['amqp', 'express', 'kafka-node', 'mqtt', 'aws-sdk', 'stomp-client', 'zeromq'];
    private readonly optionalDependencies: Dependency[] = [];

    public constructor() {
        this.protocols.forEach(protocol => {
            const devDependency = packageJson.optionalDependencies[protocol];
            if (devDependency) {
                this.optionalDependencies.push(new Dependency(protocol, devDependency));
            }
        });
    }

    public listAvailable(): string[] {
        return this.optionalDependencies.map(dependency => dependency.getPackage());
    }

    public tryToInstall(librariesToInstall: string[]): Promise<void[]> {
        return Promise.all(librariesToInstall.map(lib => {
            const find = this.optionalDependencies.find(notInstalled => lib === notInstalled.getPackage());
            if (find) {
                return find.install();
            } else {
                console.warn(`Library '${lib}' is not available for installing`);
            }
        }));
    }

}