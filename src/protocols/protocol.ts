import {Match, StringMatcher} from '../strings/string-matcher';
import {Logger} from '../loggers/logger';
import {ProtocolManager} from './protocol-manager';
const packageJson = require('../../package.json');

type Library = {
    name: string;
    version?: string;
    installed: boolean;
};

export class Protocol {
    private readonly name: string;
    private alternativeNames?: string[];
    private library?: Library;

    public constructor(name: string) {
        this.name = name;
    }

    public getName(): string {
        return this.name;
    }

    public getDescription() {
        let properties: any = {};
        if (this.alternativeNames) {
            properties.alternativeNames = this.alternativeNames;
        }
        if (this.library) {
            properties.library = this.library;
        }
        return properties;
    }

    public addAlternativeName(...alternativeNames: string[]): Protocol {
        let uniqueAlternativeNames;
        if (this.alternativeNames) {
            uniqueAlternativeNames = new Set(this.alternativeNames.concat(alternativeNames));

        } else {
            uniqueAlternativeNames = new Set(alternativeNames);
        }
        this.alternativeNames = Array.from(uniqueAlternativeNames);
        return this;
    }

    public setLibrary(libraryName: string): Protocol {
        this.library = this.createLibrary(libraryName);
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
        return new StringMatcher().sortBestMatches(name, [this.name].concat(this.alternativeNames || []))[0];
    }

    public matches(name: string, errorTolerancePct: number = 0): boolean {
        return this.getBestRating(name).rating >= 100 - errorTolerancePct;
    }

    public printTip(name: string) {
        const bestRating = this.getBestRating(name);
        if (bestRating.rating > 50) {
            Logger.warning(`${bestRating.rating}% sure you meant '${bestRating.target}'`);
            this.suggestInstallation();
        } else if (bestRating.rating > 10) {
            Logger.warning(`There is a tiny possibility (${bestRating.rating}%) you tried to type '${bestRating.target}'`);
        }
    }

    private suggestInstallation(): boolean {
        if (this.library) {
            const packageDisplay = `${this.library.name}@${this.library.version}`;
            if (!this.library.installed) {
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

    private isLibraryInstalled(libraryName: string): boolean {
        try {
            require.resolve(libraryName);
            return true;
        } catch (e) {
            /* do nothing */
        }
        return false;
    }

    private createLibrary(name: string): Library | undefined {
        const dependencies = packageJson.dependencies[name] || packageJson.optionalDependencies[name];
        if (dependencies) {
            return {
                name: name,
                version: dependencies,
                installed: this.isLibraryInstalled(name)
            };
        }
    }

}