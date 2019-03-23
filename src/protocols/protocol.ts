import {Logger} from '../loggers/logger';

type Library = {
    name: string;
    installed: boolean;
};

export enum ProtocolType {
    PUBLISHER,
    SUBSCRIPTION
}

export abstract class Protocol {
    readonly type: ProtocolType;
    private readonly name: string;
    private alternativeNames?: string[];
    private library?: Library;

    protected constructor(name: string, type: ProtocolType) {
        this.name = name;
        this.type = type;
    }

    protected getDeepDescription(): any {
        return {};
    }

    public getName(): string {
        return this.name;
    }

    public getDescription() {
        let properties: any = this.getDeepDescription();
        properties.name = this.name;
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

    public matches(type: string): boolean {
        if (typeof type === 'string') {
            try {
                return [this.name].concat(this.alternativeNames || [])
                    .filter((name: string) => name.toUpperCase() === type.toUpperCase()).length > 0;
            } catch (exc) {
                Logger.warning(`Error comparing protocols with given type '${type}': ${exc}`);
            }
        }
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
        return {
            name: name,
            installed: this.isLibraryInstalled(name)
        };
    }

}
