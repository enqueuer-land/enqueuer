import { expect } from 'chai';
import 'mocha';
import {Container, Injectable} from "./injector";
import {NullFactoryFunction} from "./factory-function";


describe('Injector', function() {

    const argumentValue = "value";
    class ParentClass {};

    @Injectable((argument: string) => argument == argumentValue)
    class SubClass extends ParentClass {
        constructor() {
            super();
        }
    }




    it('should inject object correctly', function() {
        const injected = Container().ParentClass.create(argumentValue);

        expect(injected).to.be.an.instanceOf(SubClass);
    });

    it('should inject null', function() {
        const injected = Container().ParentClass.create("wrong");

        expect(injected).to.be.null;
    });

    it('should inject NullObject', function() {
        @Injectable(NullFactoryFunction)
        class NullClass extends ParentClass {
            constructor() {
                super();
            }
        }

        const injected = Container().ParentClass.create("wrong");

        expect(injected).to.be.an.instanceOf(NullClass);
    });



});