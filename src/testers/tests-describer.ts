import {Tester} from './tester';
import prettyjson from 'prettyjson';

const options = {
    defaultIndentation: 4,
    inlineArrays: true,
    emptyArrayMsg: '-',
    keysColor: 'green',
    dashColor: 'grey'
};

export class TestsDescriber {
    public describeTests() {
        const tester = new Tester();

        const value = {
            name: ' testLabel #optional',
        };
        const ownPropertyDescriptors = Object.getOwnPropertyDescriptors(Object.getPrototypeOf(tester));
        const threeArgsAssertions = Object.keys(ownPropertyDescriptors)
            .filter((key: string) => (ownPropertyDescriptors[key].value as Function).length === 3)
            .filter((key: string) => (ownPropertyDescriptors[key].value as Function).name !== 'addTestModel')
            .map((key: string) => {
                const safeCopy: any = Object.assign({}, value);
                safeCopy[(ownPropertyDescriptors[key].value as Function).name] = ' stuffToAssert';
                return safeCopy;
            });

        const fourArgsAssertions = Object.keys(ownPropertyDescriptors)
            .filter((key: string) => (ownPropertyDescriptors[key].value as Function).length === 4)
            .map((key: string) => {
                const safeCopy: any = Object.assign({}, value, {expect: ' actualValue'});
                safeCopy[(ownPropertyDescriptors[key].value as Function).name] = ' expectedValue';
                return safeCopy;
            });
        console.log(prettyjson.render({assertions: threeArgsAssertions.concat(fourArgsAssertions)}, options));
    }

}
