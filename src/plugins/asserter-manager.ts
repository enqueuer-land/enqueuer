import { Assertion } from '../models/events/assertion';
import { Logger } from '../loggers/logger';
import { Asserter } from '../asserters/asserter';
import { NullAsserter } from '../asserters/null-asserter';
import { prettifyJson } from '../outputs/prettify-json';

type AssertionFieldTypes = 'string' | 'number' | 'boolean' | 'array' | 'null' | 'any' | 'list';
type AssertionField = {
  required?: boolean;
  type?: AssertionFieldTypes[] | AssertionFieldTypes;
  description?: string;
};

const defaultAssertionField: AssertionField = {
  required: true,
  type: 'any'
};

export interface AssertionTemplate {
  [assertionField: string]: AssertionField;
}

interface AddedAsserter {
  template: AssertionTemplate;
  createFunction: () => Asserter;
}

export class AsserterManager {
  private addedAsserters: AddedAsserter[] = [];

  public createAsserter(assertion: Assertion): Asserter {
    const matching = this.addedAsserters.filter((added: AddedAsserter) =>
      Object.keys(added.template)
        .filter(key => added.template[key].required || added.template[key].required === undefined)
        .every(requiredKey => assertion[requiredKey] !== undefined)
    );
    if (matching.length > 0) {
      return matching[0].createFunction();
    }
    Logger.error(`No asserter was found with '${JSON.stringify(assertion, null, 2)}', using default one`);
    return new NullAsserter();
  }

  public addAsserter(templateAssertion: AssertionTemplate, createFunction: () => Asserter): void {
    Object.keys(templateAssertion).forEach(
      key => (templateAssertion[key] = Object.assign({}, defaultAssertionField, templateAssertion[key]))
    );
    this.addedAsserters.unshift({
      template: templateAssertion,
      createFunction
    });
  }

  public describeMatchingAsserters(data: any): boolean {
    const matchingAsserters = this.getMatchingAsserters(data);
    console.log(`Describing asserters matching: ${data}`);
    console.log(prettifyJson(matchingAsserters));
    return matchingAsserters.asserters.length > 0;
  }

  public getMatchingAsserters(field: string | true): {
    asserters: AssertionTemplate[];
  } {
    let matching: AddedAsserter[] = this.addedAsserters;
    if (typeof field === 'string') {
      matching = this.addedAsserters.filter((added: AddedAsserter) =>
        Object.keys(added.template).some(key => key.toUpperCase().indexOf(field.toUpperCase()) !== -1)
      );
    }
    return { asserters: matching.map(added => added.template).sort() };
  }
}
