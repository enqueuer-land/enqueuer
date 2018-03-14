import {Injectable} from "./injector";
import {NullFactoryFunction} from "./factory-function";
import {Container} from "./container";

describe('Injector', function() {

    const argumentValue = "value";
    class ParentClass {}

    @Injectable((argument: string) => argument == argumentValue)
    class SubClass extends ParentClass {
        constructor() {
            super();
        }
    }

    it('should inject object correctly', function() {
        const injected = Container.get(ParentClass).create(argumentValue);

        expect(injected).toBeInstanceOf(SubClass);
    });

    it('should inject null if no Null is given and no factory function returns true', function() {
        const injected = Container.get(ParentClass).create("wrong");

        expect(injected).toBeNull();
    });

    it('should inject NullObject', function() {
        @Injectable(NullFactoryFunction)
        class NullClass extends ParentClass {
            constructor() {
                super();
            }
        }

        const injected = Container.get(ParentClass).create("wrong");
        expect(injected).toBeInstanceOf(NullClass);
    });

});