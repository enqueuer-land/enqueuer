import {Assertion} from '../models/events/assertion';
import {Logger} from '../loggers/logger';
import {Asserter} from '../asserters/asserter';
import {NullAsserter} from '../asserters/null-asserter';
import prettyjson from 'prettyjson';
import {getPrettyJsonConfig} from '../outputs/prettyjson-config';

interface AddedAsserter {
    templateAssertion: object;
    createFunction: () => Asserter;
}

export class AsserterManager {
    private addedAsserters: AddedAsserter[] = [];

    public createAsserter(assertion: Assertion): Asserter {
        const matching = this.addedAsserters
            .filter((added: AddedAsserter) => Object
                .keys(added.templateAssertion)
                .every(requiredKey => assertion[requiredKey] !== undefined));
        if (matching.length > 0) {
            return matching[0].createFunction();
        }
        Logger.error(`No asserter was found with '${assertion}', using default one`);
        return new NullAsserter();
    }

    public addAsserter(templateAssertion: object, createFunction: () => Asserter): void {
        this.addedAsserters.unshift({templateAssertion, createFunction});
    }

    public describeAsserters(field: string | true): boolean {
        let matching: AddedAsserter[] = this.addedAsserters;
        if (typeof field === 'string') {
            matching = this.addedAsserters
                .filter((added: AddedAsserter) => Object
                    .keys(added.templateAssertion)
                    .some(key => key.toUpperCase().indexOf(field.toUpperCase()) !== -1));
        }
        console.log(prettyjson.render({asserters: matching.map(added => added.templateAssertion).sort()}, getPrettyJsonConfig()));
        return matching.length > 0;
    }
}
