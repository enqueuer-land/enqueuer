import {Match, StringMatcher} from '../strings/string-matcher';
import {Logger} from '../loggers/logger';
import {ProtocolManager} from './protocol-manager';

const packageJson = require('../../package.json');

type Library = {
    name: string;
    version?: string;
};

export class Protocol {
    private readonly name: string;
    private alternativeNames: string[] = [];
    private library?: Library;

    public constructor(name: string) {
        this.name = name;
    }

    public getName(): string {
        return this.name;
    }

    public getProperties() {
        let properties: any = {
            alternativeNames: this.alternativeNames
        };
        if (this.library) {
            properties.library = {
                name: this.library.name,
                installed: this.isLibraryInstalled(),
                version: this.library.version
            };
        }
        return properties;
    }

    public addAlternativeName(...alternativeNames: string[]): Protocol {
        const uniqueAlternativeNames = new Set(this.alternativeNames.concat(alternativeNames));
        this.alternativeNames = Array.from(uniqueAlternativeNames);
        return this;
    }

    public setLibrary(libraryName: string): Protocol {
        this.library = Protocol.getDependency(libraryName);
        return this;
    }

    public registerAsPublisher(): Protocol {
        ProtocolManager.getInstance().insertPublisher(this);
        return this;
    }

    public registerAsSubscription(): Protocol {
        ProtocolManager.getInstance().insertSubscription(this);
        return this;
    }

    public getBestRating(name: string): Match {
        return new StringMatcher().sortBestMatches(name, this.alternativeNames.concat(this.name))[0];
    }

    public matches(name: string, errorTolerancePct: number = 0): boolean {
        return this.getBestRating(name).rating >= 100 - errorTolerancePct;
    }

    public suggestInstallation(): boolean {
        if (this.library) {
            const packageDisplay = `${this.library.name}@${this.library.version}`;
            if (!this.isLibraryInstalled()) {
                const installationString = `npm install ${packageDisplay} --no-optional`;
                Logger.warning(`Library '${this.library.name}' is not installed. ` +
                    `If you want to, install it using: ${installationString}`);
            }
            Logger.trace(`Protocol ${this.name} has its library ${packageDisplay} installed`);
            return true;
        }
        Logger.trace(`Protocol ${this.name} has no library to be suggested`);
        return false;
    }

    public isLibraryInstalled(): boolean {
        try {
            if (this.library) {
                require.resolve(this.library.name);
                return true;
            }
        } catch (e) {
            /* do nothing */
        }
        return false;
    }

    private static getDependency(name?: string): Library | undefined {
        if (name) {
            const dependencies = packageJson.dependencies[name] || packageJson.optionalDependencies[name];
            if (dependencies) {
                return {
                    name: name,
                    version: dependencies
                };
            }
        }
    }
}