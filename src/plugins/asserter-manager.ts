import {Assertion} from '../models/events/assertion';
import {Logger} from '../loggers/logger';
import {Asserter} from '../asserters/asserter';
import {NullAsserter} from '../asserters/null-asserter';

interface AddedAsserter {
    matcherFunction: (assertion: Assertion) => boolean;
    createFunction: () => Asserter;
}

export class AsserterManager {
    private addedAsserters: AddedAsserter[] = [];

    public createAsserter(assertion: Assertion): Asserter {
        const matching = this.addedAsserters
            .filter((added: AddedAsserter) => added.matcherFunction(assertion));
        if (matching.length > 0) {
            return matching[0].createFunction();
        }
        Logger.error(`No asserter was found with '${assertion}', using default one`);
        return new NullAsserter();
    }

    public addAsserter(matcherFunction: (assertion: Assertion) => boolean, createFunction: () => Asserter): void {
        this.addedAsserters.unshift({matcherFunction, createFunction});
    }
}
