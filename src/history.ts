let container: any = {};

export type FactoryFunction = (argument: any) => boolean;

function Injectable(factoryFunction: FactoryFunction) {
    class SuperClassContainer {
        private injectables: any = {};

        public inject = (argument: any): Promise<any> => {
            return new Promise((resolve, reject) => {
                for (const injectable in this.injectables)
                    if (this.injectables[injectable].factoryFunction(argument))
                        resolve(new this.injectables[injectable].constructor(argument));
                reject();
            });
        }

        public addInjectable = (injectable: any): void => {
            this.injectables[injectable.name] = injectable;
        }
    }

    return function(constructor: any) {
        // save a reference to the original constructor
        // var original = constructor;

        // console.log("Primeiro eu")

        var parentTarget = Object.getPrototypeOf(constructor.prototype).constructor.name;
        const className = constructor.prototype.constructor.name;
        if (!container[parentTarget]) // new Class; public method inject
            container[parentTarget] = new SuperClassContainer();
        // {
        //         inject: (argument: any): any => {
        //             return new constructor(argument);
        //         },
        //
        //     };
        container[parentTarget].addInjectable({
            name: className,
            constructor: constructor,
            factoryFunction: factoryFunction
        });
        container[parentTarget][className] = {
            factory: constructor,
            factoryFunction: factoryFunction
        };
        // Container[parentTarget][type] = constructor;
        // console.log(`FactoryFunction "${factoryFunction}"`);
        console.log(`Parent "${parentTarget}"`);
        console.log("Sub: " + className)
        console.log("ContainerFactory:: " + JSON.stringify(container[parentTarget][className].factoryFunction.toString(), null, 2))
        console.log("ContainerConstructor:: " + JSON.stringify(container[parentTarget][className].factory.toString(), null, 2))
        console.log("--- -----")

        // the new constructor behaviour
        // var f: any = function (...args: any[]) {
        //     console.log('Injectable: before class constructor', original.name);
        //     let instance = original.apply(this, args)
        //     console.log('Injectable: after class constructor', original.name);
        //     return instance;
        // }
        //
        // // copy prototype so intanceof operator still works
        // f.prototype = original.prototype;

        // return new constructor (will override original)
        return constructor;
    };
}

function FactoryMethod(classImplementation: any, methodName: string, descriptor: PropertyDescriptor): any {
    var oldMethod = descriptor.value;

    descriptor.value = function() {
        const superClassName = Object.getPrototypeOf(classImplementation.prototype).constructor.name;
        console.log(`Parent "${superClassName}"`);
        const className = classImplementation.prototype.constructor.name;
        console.log(`Class Name "${className}"`);
        console.log(`Method "${methodName}" arguments`, arguments);
        container[superClassName][className].method = oldMethod;


        container[superClassName].inject = (argument: any) => {
            for (const injectableSubClass in container[superClassName]) {
                if (container[superClassName][injectableSubClass].method(arguments)) {
                    return container[superClassName][injectableSubClass].constructor.apply(this, arguments)
                }
            }
            return null;
        }

        console.log(`Container:::: "${JSON.stringify(container, null, 2)}`, arguments);
        // let value = oldMethod.apply(null, arguments);
        // console.log(`Function is executed: ${value}`);
        return oldMethod;
    };

    return descriptor;
}

class Animal {

    coisa: string;

    public constructor (coisa: string) {
        this.coisa = coisa;
        console.log("Constructor was called: Animal");
    }

    doStuff(): void {
        console.log("Doing stuff");
    }
}

@Injectable(Fish.creatorMethod)
class Fish extends Animal {

    public constructor () {
        super("F")
        console.log("Constructor was called: Fish");
    }

    // @FactoryMethod
    public static creatorMethod(input: any): boolean {
        console.log(input);
        return input.type == "Fish";
    }

}


@Injectable((argument: any) => argument.type === "Calamari")
class Calamari extends Animal {

    public constructor () {
        super("C")
        console.log("Constructor was called: Calamari");
    }

}

// Calamari.method({type: "Fish"});
// console.log(JSON.stringify(container));
// const injected: Animal = container.Animal.inject({type: "Fish"});
// console.log(JSON.stringify(container.Animal.Fish.factoryFunction.toString()));
console.log(JSON.stringify(container.Animal.inject(1))); //Container
// console.log(JSON.stringify(new Fish()));

