import {Dependency} from './dependency';
const packageJson = require('../../package.json');

export class DependencyManager {

    private readonly protocols: string[] = ['amqp', 'express', 'kafka-node', 'mqtt', 'aws-sdk', 'stomp-client', 'zeromq'];
    private readonly devDependencies: Dependency[] = [];
    private readonly prodDependencies: Dependency[] = [];

    public constructor() {
        this.protocols.forEach(protocol => {
            const devDependency = packageJson.devDependencies[protocol];
            const prodDependency = packageJson.dependencies[protocol];
            if (devDependency) {
                this.devDependencies.push(new Dependency(protocol, devDependency));
            }
            if (prodDependency) {
                this.prodDependencies.push(new Dependency(protocol, prodDependency));
            }
        });
    }

    public listNotInstalled(): Dependency[] {
        return this.devDependencies.filter((dev => !this.prodDependencies
            .find(prod => dev.getPackage() == prod.getPackage())));
    }

    public listAvailable(): string[] {
        return this.devDependencies.map(dependency => dependency.getPackage());
    }

    public tryToInstall(librariesToInstall: string[]): Promise<void[]> {
        const notInstalled = this.listNotInstalled();
        return Promise.all(librariesToInstall.map(lib => {
            const find = notInstalled.find(notInstalled => lib === notInstalled.getPackage());
            if (find) {
                return find.install();
            } else {
                console.warn(`Library '${lib}' is not available for installing`);
            }
        }));
    }

}