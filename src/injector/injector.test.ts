import {Injectable} from "./injector";
import {NullFactoryPredicate} from "./factory-predicate";
import {Container} from "./container";

describe('Injector', function() {

    const argumentValue = "value";
    class ParentClass {}

    @Injectable((argument: string) => argument == argumentValue)
    class SubClass extends ParentClass {
        argument: string;

        constructor(argument) {
            super();
            this.argument = argument;
        }
    }

    it('should inject object correctly', function() {
        const injected = Container.get(ParentClass).createFromPredicate(argumentValue);

        expect(injected).toBeInstanceOf(SubClass);
        expect(injected.argument).toBe(argumentValue);
    });

    it('should inject null if no Null is given and no factory function returns true', function() {
        const injected = Container.get(ParentClass).createFromPredicate("wrong");

        expect(injected).toBeNull();
    });

    it('should inject NullObject', function() {
        @Injectable(NullFactoryPredicate)
        class NullClass extends ParentClass {
            constructor() {
                super();
            }
        }

        const injected = Container.get(ParentClass).createFromPredicate("wrong");
        expect(injected).toBeInstanceOf(NullClass);
    });

    it('should instantiate every subclass', function() {

        expect.extend({
            toContainInstanceOfAny(instanceList, classList) {
                for (const instance of instanceList) {
                    let instanceOfSome = true;
                    for (const clazz of classList) {
                        instanceOfSome = (instance instanceof clazz);
                        if (instanceOfSome)
                            break;
                    }
                    if (!instanceOfSome)
                        return {
                            message: () => (`${this.utils.printReceived(instance)} is not an instance of any of the list ${this.utils.printExpected(classList)}`),
                            pass: false
                        }
                }

                return {
                    message: () => (`OK`),
                    pass: true
                }
            }
        })

        class ParentEveryTestClass {}
        @Injectable()
        class SubClassA extends ParentEveryTestClass { a = "a"; constructor() { super();} }
        @Injectable()
        class SubClassB extends ParentEveryTestClass { constructor() { super();} }
        @Injectable()
        class SubClassC extends ParentEveryTestClass { constructor() { super();} }

        const injectedList: any[] = Container.get(ParentEveryTestClass).createAll({anyStuff: "blahBlah"});
        // expect(injectedList[1]).toBeInstanceOf(SubClassA)
        expect(injectedList).toContainInstanceOfAny([SubClassA, SubClassB, SubClassC]);
    });

});