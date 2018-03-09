let Container: any = {};

export type FactoryFunction = (argument: any) => boolean;

function Injectable(factoryFunction: FactoryFunction | null) {
    interface Injectable {
        name: string;
        factoryFunction: FactoryFunction;
        constructor: Function;
    }
    class SuperClassContainer {
        private injectables: any = {};
        private default: any = null;

        public create = (argument: any): any => {
                for (const injectable in this.injectables)
                    if (this.injectables[injectable].factoryFunction(argument))
                        return new this.injectables[injectable].constructor(argument);
                if (this.default)
                    return new this.default.constructor(argument);
                return null;
        }

        public addInjectable = (injectable: Injectable): void => {
            if (injectable.factoryFunction)
                this.injectables[injectable.name] = injectable;
            else
                this.default = injectable;
            console.log(`SuperClassContainer  "${JSON.stringify(this)}"`);
        }
    }

    return function(constructor: any) {
        var superClassName = Object.getPrototypeOf(constructor.prototype).constructor.name;
        const className = constructor.prototype.constructor.name;
        if (!Container[superClassName]) // new Class; public method inject
            Container[superClassName] = new SuperClassContainer();

        Container[superClassName].addInjectable({
            name: className,
            constructor: constructor,
            factoryFunction: factoryFunction
        });
        // Container[superClassName][className] = {
        //     factory: constructor,
        //     factoryFunction: factoryFunction
        // };
        // Container[superClassName][type] = constructor;
        // console.log(`FactoryFunction "${factoryFunction}"`);
        console.log(`Parent "${superClassName}"`);
        console.log("Sub: " + className)
        // console.log("ContainerFactory:: " + JSON.stringify(Container[superClassName][className].factoryFunction.toString(), null, 2))
        // console.log("ContainerConstructor:: " + JSON.stringify(Container[superClassName][className].factory.toString(), null, 2))
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

@Injectable(null)
class NullAnimal extends Animal {

    public constructor () {
        super("C")
        console.log("Constructor was called: Null");
    }

}

// Calamari.method({type: "Fish"});
// console.log(JSON.stringify(Container));
// const injected: Animal = Container.Animal.inject({type: "Fish"});
// console.log(JSON.stringify(Container.Animal.Fish.factoryFunction.toString()));
const injectedAnimal: Animal = Container.Animal.create({type: "Null"});
// console.log(JSON.stringify(injectedAnimal)); //Container
injectedAnimal.doStuff();
// console.log(JSON.stringify(new Fish()));

