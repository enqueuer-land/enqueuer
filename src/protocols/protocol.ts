import {Match, StringMatcher} from '../strings/string-matcher';
import {Logger} from '../loggers/logger';
const packageJson = require('../../package.json');

type Library = {
    name: string;
    version?: string;
};

export class Protocol {
    private readonly name: string;
    private readonly alternativeNames: string[];
    private readonly library?: Library;

    public constructor(name: string, alternativeNames: string[] = [], libraryName?: string) {
        this.name = name;
        const uniqueAlternativeNames = new Set(alternativeNames);
        uniqueAlternativeNames.add(name);
        this.alternativeNames = Array.from(uniqueAlternativeNames);
        this.library = Protocol.getDependency(libraryName);
    }

    public getName() {
        return this.name;
    }

    public getBestRating(name: string): Match {
        return new StringMatcher().sortBestMatches(name, this.alternativeNames)[0];
    }

    public matchesRatingAtLeast(name: string, minimumRating: number): boolean {
        return this.getBestRating(name).rating >= minimumRating;
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

    private isLibraryInstalled(): boolean {
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