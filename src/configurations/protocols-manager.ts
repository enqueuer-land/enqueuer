import {Logger} from '../loggers/logger';
import {Match, StringMatcher} from '../strings/string-matcher';

const packageJson = require('../../package.json');

export type Library = {
    name: string;
    version: string;
};

export type Protocol = {
    alternativeNames?: string[];
    library?: Library;
};

export type ProtocolGroup = {
    [propName: string]: Protocol;
};

export class ProtocolsManager {

    public static readonly subscriptionsGroup: ProtocolGroup = {
        amqp: {
            library: ProtocolsManager.getDependency('amqp')
        },
        file: {},
        http: {
            alternativeNames: ['http-proxy', 'https-proxy', 'http-server', 'https-server', 'http', 'https'],
            library: ProtocolsManager.getDependency('express')
        },
        kafka: {
            library: ProtocolsManager.getDependency('kafka-node')
        },
        mqtt: {
            library: ProtocolsManager.getDependency('mqtt')
        },
        sqs: {
            library: ProtocolsManager.getDependency('aws-sdk')
        },
        stdin: {
            alternativeNames: ['standard-input']
        },
        stomp: {
            library: ProtocolsManager.getDependency('stomp-client')
        },
        tcp: {},
        udp: {},
        uds: {},
        zeromq: {
            alternativeNames: ['zero-mq-sub'],
            library: ProtocolsManager.getDependency('zeromq')
        }
    };

    public static readonly publishersGroup: ProtocolGroup = {
        amqp: {
            library: ProtocolsManager.getDependency('amqp')
        },
        file: {},
        http: {
            alternativeNames: ['http', 'https', 'http-client', 'https-client']
        },
        kafka: {
            library: ProtocolsManager.getDependency('kafka-node')
        },
        mqtt: {
            library: ProtocolsManager.getDependency('mqtt')
        },
        sqs: {
            library: ProtocolsManager.getDependency('aws-sdk')
        },
        stdout: {
            alternativeNames: ['standard-output']
        },
        stomp: {
            library: ProtocolsManager.getDependency('stomp-client')
        },
        tcp: {},
        udp: {},
        uds: {},
        zeromq: {
            alternativeNames: ['zero-mq-sub'],
            library: ProtocolsManager.getDependency('zeromq')
        }
    };

    public findLibraryFromName(name: string, group: ProtocolGroup): Library | undefined {
        const protocol = this.findProtocolFromName(name, group);
        if (protocol && group[protocol]) {
            return group[protocol].library;
        }
    }

    public findProtocolFromName(name: string, group: ProtocolGroup): string | undefined {
        return Object.keys(group)
            .find(key => {
                if (key == name) {
                    return true;
                }
                return (group[key].alternativeNames || [])
                    .some(alternativeName => alternativeName == name);
            });
    }

    public listAvailable(): string[] {
        return [...new Set([...Object.keys(ProtocolsManager.subscriptionsGroup),
                                    ...Object.keys(ProtocolsManager.publishersGroup)])].sort();
    }

    public suggestSubscriptionBasedOn(type?: string): number {
        return this.suggestBasedOnGroup(ProtocolsManager.subscriptionsGroup, type);
    }

    public suggestPublisherBasedOn(type: string): number {
        return this.suggestBasedOnGroup(ProtocolsManager.publishersGroup, type);
    }

    private suggestBasedOnGroup(group: ProtocolGroup, type?: string): number {
        const available: Set<string> = new Set();
        Object.keys(group).forEach(key => {
            available.add(key);
            (group[key].alternativeNames || []).forEach(name => available.add(name));
        });

        let libraries: Set<Library> = new Set();
        let matches: Match[] = new StringMatcher().sortBestMatches(type as string, Array.from(available));
        matches
            .filter((value, index) => index <= 2)
            .forEach((match: Match) => {
                Logger.warning(`${match.rating}% sure you meant '${match.target}'`);
                const library = this.findLibraryFromName(match.target, group);
                if (library) {
                    libraries.add(library);
                }
            });

        libraries.forEach(library => this.suggestInstallation(library));
        return libraries.size;
    }

    private suggestInstallation(library: Library) {
        if (!ProtocolsManager.isLibraryInstalled(library.name)) {
            Logger.warning(`Library '${library.name}' is not installed. ` +
                `If you want to, install it using: 'npm install ${library.name}@${library.version} --no-optional'`);
        }
    }

    private static isLibraryInstalled(name: string): boolean {
        try {
            require.resolve(name);
            return true;
        } catch (e) {
            return false;
        }
    }

    public static getDependency(name: string): Library | undefined {
        const dependencies = packageJson.dependencies[name] || packageJson.optionalDependencies[name];
        if (dependencies) {
            return {
                name: name,
                version: dependencies
            };
        }
    }
}