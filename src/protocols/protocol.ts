import {Logger} from '../loggers/logger';
import {DefaulHookEvents} from '../models/events/event';

type Library = {
    name: string;
    installed: boolean;
};

export enum ProtocolType {
    PUBLISHER,
    SUBSCRIPTION
}

export interface HookEventsDescription {
    [prop: string]: string[];
}

export abstract class Protocol {
    private readonly type: ProtocolType;
    private readonly name: string;
    private readonly hookEventsDescription: HookEventsDescription = {};
    private alternativeNames?: string[];
    private library?: Library;

    protected constructor(name: string, type: ProtocolType, hookEventsDescription: string[] | HookEventsDescription = {}) {
        this.name = name;
        this.type = type;
        if (Array.isArray(hookEventsDescription)) {
            this.hookEventsDescription[DefaulHookEvents.ON_MESSAGE_RECEIVED] = hookEventsDescription;
        } else {
            this.hookEventsDescription = hookEventsDescription;
        }
        this.hookEventsDescription[DefaulHookEvents.ON_INIT] = [];
        this.hookEventsDescription[DefaulHookEvents.ON_FINISH] = [];
    }

    public isSubscription(): boolean {
        return this.type === ProtocolType.SUBSCRIPTION;
    }

    public isPublisher(): boolean {
        return this.type === ProtocolType.PUBLISHER;
    }

    public getName(): string {
        return this.name;
    }

    public getDescription() {
        const description: any = {
            name: this.name
        };
        if (Object.keys(this.hookEventsDescription).length > 0) {
            description.hookEvents = this.hookEventsDescription;
        }
        return description;
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
                    .some((name: string) => name.toUpperCase().includes(type.toUpperCase()));
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
